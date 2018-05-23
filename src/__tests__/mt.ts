import WordMT from "../";

describe("MT", () => {
    it("has no corpus", () => {
        const mt = new WordMT();
        const result = mt.translate("Βίβλος γενέσεως Ἰησοῦ Χριστοῦ υἱοῦ Δαυὶδ υἱοῦ Ἀβραάμ.");
        expect(result.toString()).toEqual("0 []");
    });

    it("has the input as corpus", () => {
        const mt = new WordMT();
        const source = "Βίβλος γενέσεως Ἰησοῦ Χριστοῦ υἱοῦ Δαυὶδ υἱοῦ Ἀβραάμ.";
        const target = "The book of the genealogy of Jesus Christ, son of David, son of Abraham:";
        mt.appendCorpus([[source, target]]);
        const result = mt.translate(source);
        // TODO: I expect more from this!
        expect(result.toString()).toEqual("0 []");
    });
});
