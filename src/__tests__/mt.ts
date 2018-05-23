import WordMT from "../";

describe("MT", () => {
    it("has no corpus", () => {
        const mt = new WordMT();
        const result = mt.translate("Βίβλος γενέσεως Ἰησοῦ Χριστοῦ υἱοῦ Δαυὶδ υἱοῦ Ἀβραάμ.");
        expect(result.toString()).toEqual("");
    });


});
