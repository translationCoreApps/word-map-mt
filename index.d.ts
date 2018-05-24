import Suggestion from "word-map/structures/Suggestion";
import Prediction from "word-map/structures/Prediction";
import Alignment from "word-map/structures/Alignment";
export interface PredictionTable {
    [key: string]: Prediction[];
}
/**
 * Word Machine Translation
 */
export default class WordMT {
    private map;
    private corpus;
    private savedAlignments;
    private suggestions;
    constructor();
    /**
     * Adds an array of corpus sentences to the translator.
     * @param {string[][]} corpus - an array of source and target corpus sentences.
     */
    appendCorpus(corpus: string[][]): void;
    /**
     * Appends a bunch of saved alignments to the translator.
     * @param {Alignment[]} alignments
     */
    appendSavedAlignments(alignments: Alignment[]): void;
    /**
     * Appends a saved alignment to the translator
     * @param {string} source - the aligned source n-gram text
     * @param {string} target - the aligned target n-gram text
     */
    appendSavedAlignmentsString(source: string, target: string): void;
    /**
     * Aligns the corpus so we can produce translations
     */
    alignCorpus(): void;
    /**
     * Generates a verbose translation.
     * @param {string} sourceSentence
     * @return {PredictionTable}
     */
    translateVerbose(sourceSentence: string): PredictionTable;
    /**
     * Generates a translation suggestion
     * @param {string} sourceSentence
     * @param {number} maxSuggestions - the number of suggestions to produce
     * @return {Suggestion}
     */
    translate(sourceSentence: string, maxSuggestions?: number): Suggestion[];
    /**
     * Finds predictions that are made against an ngram
     * @param {Ngram} sourceNgram
     * @return {Prediction[]}
     */
    private findPredictions(sourceNgram);
}
