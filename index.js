"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const word_map_1 = require("word-map");
const Lexer_1 = require("word-map/Lexer");
const Suggestion_1 = require("word-map/structures/Suggestion");
const Parser_1 = require("word-map/Parser");
const SentenceIndex_1 = require("./SentenceIndex");
const Engine_1 = require("word-map/Engine");
/**
 * Word Machine Translation
 */
class WordMT {
    constructor() {
        this.map = new word_map_1.default();
        this.suggestions = [];
        this.corpus = [];
        this.savedAlignments = [];
    }
    /**
     * Adds an array of corpus sentences to the translator.
     * @param {string[][]} corpus - an array of source and target corpus sentences.
     */
    appendCorpus(corpus) {
        this.corpus = corpus;
        this.map.appendCorpus(corpus);
    }
    /**
     * Appends a bunch of saved alignments to the translator.
     * @param {Alignment[]} alignments
     */
    appendSavedAlignments(alignments) {
        this.map.appendSavedAlignments(alignments);
        this.savedAlignments = this.savedAlignments.concat(alignments);
    }
    /**
     * Appends a saved alignment to the translator
     * @param {string} source - the aligned source n-gram text
     * @param {string} target - the aligned target n-gram text
     */
    appendSavedAlignmentsString(source, target) {
        const alignments = this.map.appendSavedAlignmentsString(source, target);
        this.savedAlignments = this.savedAlignments.concat(alignments);
    }
    /**
     * Aligns the corpus so we can produce translations
     */
    alignCorpus() {
        this.suggestions = [];
        for (const pair of this.corpus) {
            this.suggestions.push(this.map.predict(pair[0], pair[1])[0]);
            // TODO: index predictions by source token so we can look them up faster.
        }
    }
    /**
     * Generates a verbose translation.
     * @param {string} sourceSentence
     * @return {PredictionTable}
     */
    translateVerbose(sourceSentence) {
        if (this.suggestions.length === 0) {
            this.alignCorpus();
        }
        const sourceTokens = Lexer_1.default.tokenize(sourceSentence);
        const sourceNgrams = Parser_1.default.ngrams(sourceTokens);
        const table = {};
        const sentenceIndex = new SentenceIndex_1.default(sourceTokens);
        for (const n of sourceNgrams) {
            // TRICKY: we need predictions for each token position
            const key = n.key + n.tokenPosition;
            const ngramPredictions = this.findPredictions(n);
            if (ngramPredictions.length > 0) {
                // this is just a temporary sorting
                table[key] = Engine_1.default.sortPredictions(ngramPredictions);
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
    translate(sourceSentence, maxSuggestions = 1) {
        const predictionTable = this.translateVerbose(sourceSentence);
        const suggestion = new Suggestion_1.default();
        for (const key of Object.keys(predictionTable)) {
            // taking the easy route and just taking the first prediction for the n-gram
            // TODO: for the suggestion to properly sort predictions we'd need to replace the
            // source n-grams in the predictions with new n-grams built from tokens in the source sentence.
            // otherwise they will have positions based on the corpus.
            suggestion.addPrediction(predictionTable[key][0]);
        }
        return [suggestion];
    }
    /**
     * Finds predictions that are made against an ngram
     * @param {Ngram} sourceNgram
     * @return {Prediction[]}
     */
    findPredictions(sourceNgram) {
        const predictions = [];
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
exports.default = WordMT;
