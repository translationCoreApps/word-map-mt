import Ngram from "word-map/structures/Ngram";
import Token from "word-map/structures/Token";
import NgramIndex from "word-map/index/NgramIndex";
/**
 * A collection of indexes on the static content.
 * NOTE: this is a variation of the static index found in {@link WordMap} with the target sentence removed.
 */
export default class StaticIndex {
    private ngramFreqIndex;
    private tokenLen;
    private charLength;
    /**
     * Returns an index of source n-gram frequencies in the corpus
     * @return {NgramIndex}
     */
    readonly ngramFrequency: NgramIndex;
    /**
     * Returns the {@link Token} length of the entire source
     * @return {number}
     */
    readonly tokenLength: number;
    /**
     * Returns the character length of the entire source
     * @return {number}
     */
    readonly characterLength: number;
    constructor();
    /**
     * Adds a sentence to the index.
     * The tokens in these n-grams must be measured for accurate positional metrics.
     * The n-grams are passed as arguments instead of being generated internally to reduce
     * duplicating work.
     *
     * @param sourceTokens - the source sentence tokens
     * @param sourceNgrams - the source sentence n-grams
     */
    addSentence(sourceTokens: Token[], sourceNgrams: Ngram[]): void;
}
