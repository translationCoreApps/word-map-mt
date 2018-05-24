import Token from "word-map/structures/Token";
import StaticIndex from "./StaticIndex";
/**
 * A collection of indexes for a sentence
 */
export default class SentenceIndex {
    private staticIndex;
    constructor(sentence: Token[]);
    /**
     * Returns an index of static metrics
     * @return {StaticIndex}
     */
    readonly static: StaticIndex;
}
