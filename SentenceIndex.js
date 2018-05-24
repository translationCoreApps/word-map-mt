"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Parser_1 = require("word-map/Parser");
const StaticIndex_1 = require("./StaticIndex");
/**
 * A collection of indexes for a sentence
 */
class SentenceIndex {
    constructor(sentence) {
        this.staticIndex = new StaticIndex_1.default();
        const ngrams = Parser_1.default.ngrams(sentence);
        this.staticIndex.addSentence(sentence, ngrams);
    }
    /**
     * Returns an index of static metrics
     * @return {StaticIndex}
     */
    get static() {
        return this.staticIndex;
    }
}
exports.default = SentenceIndex;
