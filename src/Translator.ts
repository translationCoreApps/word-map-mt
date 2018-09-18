import WordMAP, {Alignment, Engine, Ngram, Parser, Prediction, Suggestion} from "wordmap";
import Lexer from "wordmap-lexer";
import SentenceIndex from "./SentenceIndex";

/**
 * A keyed table of predictions
 */
export interface PredictionTable {
    [key: string]: Prediction[];
}

/**
 * Produces WordMAP based Machine Translation.
 */
export default class Translator {
    /**
     * An instance of WordMAP
     */
    private map: WordMAP;

    /**
     * Textual data used as the prediction dataset
     */
    private corpus: string[][];

    /**
     * Human approved word alignments
     */
    private alignmentMemory: Alignment[];
    private suggestions: Suggestion[];
    private predictions: PredictionTable;

    constructor() {
        this.map = new WordMAP();
        this.suggestions = [];
        this.corpus = [];
        this.alignmentMemory = [];
        this.predictions = {};
    }

    /**
     * Adds an array of corpus sentences to the translator.
     * @param {string[][]} corpus - an array of source and target corpus sentences.
     */
    public appendCorpus(corpus: string[][]) {
        this.corpus = corpus;
        this.map.appendCorpus(corpus);
    }

    /**
     * Appends an array of human approved word alignments.
     * This increases accuracy.
     * @param {Alignment[]} alignments
     */
    public appendAlignmentMemory(alignments: Alignment[]) {
        this.map.appendAlignmentMemory(alignments);
        this.alignmentMemory = this.alignmentMemory.concat(alignments);
    }

    /**
     * Appends a human approved word alignment.
     * This increases accuracy.
     * @param {string} source - the aligned source n-gram text
     * @param {string} target - the aligned target n-gram text
     */
    public appendAlignmentMemoryString(source: string, target: string) {
        const alignments: Alignment[] = this.map.appendAlignmentMemoryString(source, target);
        this.alignmentMemory = this.alignmentMemory.concat(alignments);
    }

    /**
     * Generates a table of sorted translation predictions for various n-gram combinations.
     * @param {string} sourceSentence - the sentence being translated
     * @param maxSuggestions - the maximum number of suggestions to generate
     * @return {PredictionTable}
     */
    public translateVerbose(sourceSentence: string, maxSuggestions: number = 1): PredictionTable {
        if (this.suggestions.length === 0) {
            this.alignCorpus(maxSuggestions);
        }

        const sourceTokens = Lexer.tokenize(sourceSentence);
        const sourceNgrams = Parser.ngrams(sourceTokens);
        const table: PredictionTable = {};
        const sentenceIndex = new SentenceIndex(sourceTokens);

        for (const n of sourceNgrams) {
            // TRICKY: we need predictions for each token position
            const key = n.key + n.tokenPosition;
            const ngramPredictions = this.findPredictions(n);
            if (ngramPredictions.length > 0) {
                // this is just a temporary sorting
                table[key] = Engine.sortPredictions(ngramPredictions);
                // TODO: perform additional filtering by comparing the prediction scores with the sentence metrics.
            }
        }

        return table;
    }

    /**
     * Generates translation predictions for a sentence
     * @param {string} sourceSentence - the sentence being translated
     * @param {number} maxSuggestions - the number of suggestions to produce
     * @return {Suggestion}
     */
    public translate(sourceSentence: string, maxSuggestions: number = 1): Suggestion[] {
        const predictionsTable = this.translateVerbose(sourceSentence, maxSuggestions);
        const suggestions: Suggestion[] = [];
        // TODO: this is not the best way to build suggestions, but it works for now
        for (const key of Object.keys(predictionsTable)) {
            for (let i = 0; i < predictionsTable[key].length && i < maxSuggestions; i++) {
                if (!suggestions[i]) {
                    suggestions[i] = new Suggestion();
                }
                suggestions[i].addPrediction(predictionsTable[key][i]);
            }
        }
        return suggestions;
    }

    /**
     * Adds a prediction to our mini-index
     * @param {Prediction} prediction
     */
    private addPrediction(prediction: Prediction) {
        const key = prediction.source.key;
        if (!(key in this.predictions)) {
            this.predictions[key] = [];
        }
        this.predictions[key].push(prediction);
    }

    /**
     * Aligns the corpus so we can produce translations
     */
    private alignCorpus(maxSuggestions: number = 1) {
        this.suggestions = [];
        for (const pair of this.corpus) {
            const suggestions = this.map.predict(pair[0], pair[1], maxSuggestions);
            // TRICKY: for now we are just taking the best prediction
            for (const p of suggestions[0].getPredictions()) {
                this.addPrediction(p);
            }
        }
        // if there was no corpus we still want to use the saved alignments
        for (const a of this.alignmentMemory) {
            const p = new Prediction(a);
            // TRICKY: give saved alignments a strong confidence
            p.setScore("confidence", 1);
            this.addPrediction(p);
        }
    }

    /**
     * Finds predictions that are made against an n-gram.
     * @param {Ngram} sourceNgram
     * @return {Prediction[]}
     */
    private findPredictions(sourceNgram: Ngram): Prediction[] {
        if (sourceNgram.key in this.predictions) {
            return this.predictions[sourceNgram.key];
        } else {
            return [];
        }
    }
}
