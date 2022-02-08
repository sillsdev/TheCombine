import { Gloss } from "api/models";
import {
  newDefinition,
  newFlag,
  newGloss,
  newSense,
  newWord,
} from "types/word";
import {
  cleanDefinitions,
  cleanGlosses,
  compareFlags,
  firstGlossText,
  getAnalysisLangsFromWords,
  sep,
} from "types/wordUtilities";

describe("wordUtilities", () => {
  describe("cleanDefinitions", () => {
    it("removes empty definitions", () => {
      const text = "Text";
      const defs = [
        newDefinition("", "SansText1"),
        newDefinition(text, "AvecText1"),
        newDefinition("", "SansText2"),
        newDefinition(text, "AvecText2"),
      ];
      const cleaned = cleanDefinitions(defs);
      expect(cleaned).toHaveLength(2);
      expect(cleaned[0].text).toEqual(text);
      expect(cleaned[1].text).toEqual(text);
    });
    it("combines same-language definitions", () => {
      const text = "Text";
      const langA = "2xText + 1xBlank";
      const langB = "3xText";
      const defs = [
        newDefinition(text, langA),
        newDefinition(text, langB),
        newDefinition("", langA),
        newDefinition(text, langB),
        newDefinition(text, langA),
        newDefinition(text, langB),
      ];
      const cleaned = cleanDefinitions(defs);
      expect(cleaned).toHaveLength(2);
      const text2 = [text, text].join(sep);
      expect(cleaned.find((d) => d.language === langA)?.text).toEqual(text2);
      const text3 = [text, text, text].join(sep);
      expect(cleaned.find((d) => d.language === langB)?.text).toEqual(text3);
    });
  });

  describe("cleanGlosses", () => {
    it("removes empty glosses", () => {
      const text = "Text";
      const glosses = [
        newGloss("", "SansText1"),
        newGloss(text, "AvecText1"),
        newGloss("", "SansText2"),
        newGloss(text, "AvecText2"),
      ];
      const cleaned = cleanGlosses(glosses);
      expect(cleaned).toHaveLength(2);
      expect(cleaned[0].def).toEqual(text);
      expect(cleaned[1].def).toEqual(text);
    });
    it("combines same-language glosses", () => {
      const text = "Text";
      const langA = "2xText + 1xBlank";
      const langB = "3xText";
      const glosses = [
        newGloss(text, langA),
        newGloss(text, langB),
        newGloss("", langA),
        newGloss(text, langB),
        newGloss(text, langA),
        newGloss(text, langB),
      ];
      const cleaned = cleanGlosses(glosses);
      expect(cleaned).toHaveLength(2);
      const text2 = [text, text].join(sep);
      expect(cleaned.find((d) => d.language === langA)?.def).toEqual(text2);
      const text3 = [text, text, text].join(sep);
      expect(cleaned.find((d) => d.language === langB)?.def).toEqual(text3);
    });
  });

  describe("compareFlags", () => {
    const activeFlag = newFlag("Text");
    const blankFlag = newFlag();
    blankFlag.active = true;
    const inactiveFlag = newFlag();
    const sillyFlag = newFlag();
    sillyFlag.text = "An inactive flag's text is ignored";
    it("returns <0 if first Flag active and second flag isn't or is but has alphabetically later text", () => {
      expect(compareFlags(blankFlag, activeFlag)).toBeLessThan(0);
      expect(compareFlags(blankFlag, inactiveFlag)).toBeLessThan(0);
      expect(compareFlags(activeFlag, sillyFlag)).toBeLessThan(0);
    });
    it("returns >0 if second flag is active and first flag isn't or is but has alphabetically later text", () => {
      expect(compareFlags(activeFlag, blankFlag)).toBeGreaterThan(0);
      expect(compareFlags(inactiveFlag, blankFlag)).toBeGreaterThan(0);
      expect(compareFlags(sillyFlag, activeFlag)).toBeGreaterThan(0);
    });
    it("returns 0 if both flags inactive or both are active with the same text", () => {
      expect(compareFlags(activeFlag, activeFlag)).toEqual(0);
      expect(compareFlags(blankFlag, blankFlag)).toEqual(0);
      expect(compareFlags(inactiveFlag, sillyFlag)).toEqual(0);
    });
  });

  describe("firstGlossText", () => {
    it("returns the text of the input sense's first gloss, if it exists", () => {
      const sense = newSense();
      expect(firstGlossText(sense)).toEqual("");
      sense.glosses.push({} as Gloss, newGloss("NotTheFirst"));
      expect(firstGlossText(sense)).toEqual("");
      const text = "TheFirst";
      sense.glosses[0] = newGloss(text);
      expect(firstGlossText(sense)).toEqual(text);
    });
  });

  describe("getAnalysisLangsFromWords", () => {
    it("returns every language code without duplicates", () => {
      const words = [newWord("one sense"), newWord("two sense")];
      const sense0 = newSense();
      sense0.definitions = [newDefinition("red sense", "1")];
      sense0.glosses = [newGloss("blue sense", "2")];
      words[0].senses = [sense0];
      const sense1A = newSense();
      sense1A.definitions = [
        newDefinition("black sense", "1"),
        newDefinition("blue sense", "3"),
      ];
      sense1A.glosses = [];
      const sense1B = newSense();
      sense1B.definitions = [];
      sense1B.glosses = [
        newGloss("old sense", "2"),
        newGloss("new sense", "4"),
      ];
      words[1].senses = [sense1A, sense1B];
      const langs = getAnalysisLangsFromWords(words);
      expect(langs.sort()).toStrictEqual(["1", "2", "3", "4"]);
    });
  });
});
