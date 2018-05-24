import WordMap from 'word-map';
import Lexer from 'word-map/Lexer';
import Suggestion from "word-map/structures/Suggestion";
import Prediction from "word-map/structures/Prediction";
import Ngram from "word-map/structures/Ngram";
import Parser from "word-map/Parser";
import SentenceIndex from "./SentenceIndex";
import Engine from "word-map/Engine";
import Alignment from "word-map/structures/Alignment";

export interface PredictionTable {
    [key: string]: Prediction[];
}

/**
 * Word Machine Translation
 */
export default class WordMT {
    private map: WordMap;
    private corpus: string[][];
    private savedAlignments: Alignment[];
    private suggestions: Suggestion[];
    private predictions: PredictionTable;

    constructor() {
        this.map = new WordMap();
        this.suggestions = [];
        this.corpus = [];
        this.savedAlignments = [];
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
     * Appends a bunch of saved alignments to the translator.
     * @param {Alignment[]} alignments
     */
    public appendSavedAlignments(alignments: Alignment[]) {
        this.map.appendSavedAlignments(alignments);
        this.savedAlignments = this.savedAlignments.concat(alignments);
    }

    /**
     * Appends a saved alignment to the translator
     * @param {string} source - the aligned source n-gram text
     * @param {string} target - the aligned target n-gram text
     */
    public appendSavedAlignmentsString(source: string, target: string) {
        const alignments: Alignment[] = this.map.appendSavedAlignmentsString(source, target);
        this.savedAlignments = this.savedAlignments.concat(alignments);
    }

    /**
     * Generates a verbose translation.
     * @param {string} sourceSentence
     * @param maxSuggestions
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
                table[key] = Engine.sortPredictions(ngramPredictions)
                // TODO: filter/sort predictions by comparing the prediction scores with the sentence metrics.
            }
        }

        return table;
    }

    /**
     * Generates a translation suggestion
     * @param {string} sourceSentence
     * @param {number} maxSuggestions - the number of suggestions to produce
     * @return {Suggestion}
     */
    public translate(sourceSentence: string, maxSuggestions: number = 1): Suggestion[] {
        const predictionTable = this.translateVerbose(sourceSentence, maxSuggestions);
        const suggestion = new Suggestion();
        for (const key of Object.keys(predictionTable)) {
            // taking the easy route and just taking the first prediction for the n-gram
            // TODO: for the suggestion to properly sort alignments we'd need to replace the
            // source n-grams in the alignments with new n-grams built from tokens in the source sentence.
            // otherwise they will have positions based on the corpus.
            suggestion.addPrediction(predictionTable[key][0]);
        }
        return [suggestion];
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
        for (const a of this.savedAlignments) {
            const p = new Prediction(a);
            // TRICKY: give saved alignments a strong confidence
            p.setScore("confidence", 1);
            this.addPrediction(p);
        }
    }

    /**
     * Finds predictions that are made against an n-gram
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
