import WordMT from "../";
import Suggestion from "word-map/structures/Suggestion";

describe("MT", () => {
    it("has no corpus", () => {
        const mt = new WordMT();
        const result = mt.translate("Βίβλος γενέσεως Ἰησοῦ Χριστοῦ υἱοῦ Δαυὶδ υἱοῦ Ἀβραάμ.");
        expect(result.toString()).toEqual("0 []");
    });

    it("only has saved alignments", () => {
        const mt = new WordMT();
        const source = "Βίβλος γενέσεως Ἰησοῦ Χριστοῦ υἱοῦ Δαυὶδ υἱοῦ Ἀβραάμ.";
        mt.appendSavedAlignmentsString("Βίβλος", "book");
        mt.appendSavedAlignmentsString("γενέσεως", "genealogy");
        const result: Suggestion[] = mt.translate(source);
        console.log("input as corpus\n", result.map((s) => {
                return s.toString();
            })
        );
    });

    it("has the input as corpus", () => {
        const mt = new WordMT();
        const source = "Βίβλος γενέσεως Ἰησοῦ Χριστοῦ υἱοῦ Δαυὶδ υἱοῦ Ἀβραάμ.";
        const target = "The book of the genealogy of Jesus Christ, son of David, son of Abraham:";
        mt.appendCorpus([[source, target]]);
        const result: Suggestion[] = mt.translate(source);
        console.log("input as corpus\n", result.map((s) => {
                return s.toString();
            })
        );
    });

    it("has saved alignments, and the input as corpus", () => {
        const mt = new WordMT();
        const source = "Βίβλος γενέσεως Ἰησοῦ Χριστοῦ υἱοῦ Δαυὶδ υἱοῦ Ἀβραάμ.";
        const target = "The book of the genealogy of Jesus Christ, son of David, son of Abraham:";
        mt.appendCorpus([[source, target]]);
        mt.appendSavedAlignmentsString("Βίβλος", "book");
        mt.appendSavedAlignmentsString("γενέσεως", "genealogy");
        mt.appendSavedAlignmentsString("Χριστοῦ", "Christ");
        const result: Suggestion[] = mt.translate(source);
        console.log("input as corpus\n", result.map((s) => {
                return s.toString();
            })
        );
    });
});
