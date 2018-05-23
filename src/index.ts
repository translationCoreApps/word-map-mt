import WordMap from 'word-map';
import Lexer from 'word-map/Lexer';
import Suggestion from "word-map/structures/Suggestion";
import Prediction from "word-map/structures/Prediction";
import Ngram from "word-map/structures/Ngram";
import Parser from "word-map/Parser";
import UnalignedSentenceIndex from "word-map/index/UnalignedSentenceIndex";
import Token from "word-map/structures/Token";

export interface PredictionTable {
    [key: string]: Prediction[];
}

/**
 * Word Machine Translation
 */
export default class WordMT {
    private map: WordMap;
    private suggestions: Suggestion[];

    constructor() {
        this.map = new WordMap();
        this.suggestions = [];
    }

    /**
     * Adds an array of corpus sentences to the translator.
     * @param {string[][]} corpus - an array of source and target corpus sentences.
     */
    public appendCorpus(corpus: string[][]) {
        this.map.appendCorpus(corpus);

        // build alignment suggestions
        this.suggestions = [];
        for (const pair of corpus) {
            this.suggestions.push(this.map.predict(pair[0], pair[1])[0]);
            // TODO: index predictions by source token so we can look them up faster.
        }
    }

    public translate(sourceSentence: string): Suggestion {
        const sourceTokens = Lexer.tokenize(sourceSentence);
        const sourceNgrams = Parser.ngrams(sourceTokens);
        const predictions: PredictionTable = {};
        // TODO: we'll need to index the sentence similar to how we index the unaligned sentence pair.
        // we probably need to create a new index class to manage that.
        // const sentenceIndex = new SentenceIndex();
        // sentenceIndex.append([sourceTokens], []);

        for (const n of sourceNgrams) {
            // TRICKY: we need predictions for each token position
            const key = n.key + n.tokenPosition;
            predictions[key] = this.findPredictions(n);
            // TODO: filter/sort predictions by comparing the prediction scores with the sentence metrics.
        }

        return new Suggestion();
    }

    /**
     * Finds predictions that are made against an ngram
     * @param {Ngram} sourceNgram
     * @return {Prediction[]}
     */
    private findPredictions(sourceNgram: Ngram): Prediction[] {
        const predictions: Prediction[] = [];
        for (const s of this.suggestions) {
            for (const p of s.getPredictions()) {
                if (p.source.looksLike(sourceNgram)) {
                    predictions.push(p);
                }
            }
        }
        return predictions;
    }
}
