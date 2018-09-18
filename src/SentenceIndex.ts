import {Parser} from "wordmap";
import StaticIndex from "./StaticIndex";
import {Token} from "wordmap-lexer";

/**
 * A collection of indexes for a sentence
 */
export default class SentenceIndex {
    private staticIndex: StaticIndex;

    constructor(sentence: Token[]) {
        this.staticIndex = new StaticIndex();
        const ngrams = Parser.ngrams(sentence);
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
