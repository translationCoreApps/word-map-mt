"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const NgramIndex_1 = require("word-map/index/NgramIndex");
/**
 * A collection of indexes on the static content.
 * NOTE: this is a variation of the static index found in {@link WordMap} with the target sentence removed.
 */
class StaticIndex {
    /**
     * Returns an index of source n-gram frequencies in the corpus
     * @return {NgramIndex}
     */
    get ngramFrequency() {
        return this.ngramFreqIndex;
    }
    /**
     * Returns the {@link Token} length of the entire source
     * @return {number}
     */
    get tokenLength() {
        return this.tokenLen;
    }
    /**
     * Returns the character length of the entire source
     * @return {number}
     */
    get characterLength() {
        return this.charLength;
    }
    constructor() {
        this.ngramFreqIndex = new NgramIndex_1.default();
        this.tokenLen = 0;
        this.charLength = 0;
    }
    /**
     * Adds a sentence to the index.
     * The tokens in these n-grams must be measured for accurate positional metrics.
     * The n-grams are passed as arguments instead of being generated internally to reduce
     * duplicating work.
     *
     * @param sourceTokens - the source sentence tokens
     * @param sourceNgrams - the source sentence n-grams
     */
    addSentence(sourceTokens, sourceNgrams) {
        // token length
        this.tokenLen += sourceTokens.length;
        // character length
        for (const token of sourceTokens) {
            this.charLength += token.toString().length;
        }
        // n-gram frequency
        for (const ngram of sourceNgrams) {
            this.ngramFreqIndex.increment(ngram);
        }
    }
}
exports.default = StaticIndex;
