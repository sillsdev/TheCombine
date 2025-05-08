import { type Sense, Status, GramCatGroup } from "api/models";
import {
  type MergeTreeSense,
  newMergeTreeSense,
} from "goals/MergeDuplicates/MergeDupsTreeTypes";
import { combineIntoFirstSense } from "goals/MergeDuplicates/Redux/reducerUtilities";
import { newSemanticDomain } from "types/semanticDomain";
import { newDefinition, newGloss } from "types/word";
import { randomIntString } from "utilities/utilities";

function mockMergeTreeSense(partialSense?: Partial<Sense>): MergeTreeSense {
  const treeSense = newMergeTreeSense("", randomIntString(), 0);
  return { ...treeSense, sense: { ...treeSense.sense, ...partialSense } };
}

describe("combineIntoFirstSense", () => {
  it("marks all but the first sense as Status.Duplicate", () => {
    const senses = [
      mockMergeTreeSense(),
      mockMergeTreeSense(),
      mockMergeTreeSense(),
      mockMergeTreeSense(),
    ];
    combineIntoFirstSense(senses);
    senses.map((ts, i) => {
      expect(ts.sense.accessibility).toEqual(
        i ? Status.Duplicate : Status.Active
      );
    });
  });

  it("adds non-duplicate-id semantic domains to first sense", () => {
    const senses = [
      mockMergeTreeSense({
        semanticDomains: [newSemanticDomain("5.5", "Fire", "en")],
      }),
      mockMergeTreeSense({
        semanticDomains: [
          newSemanticDomain("5.5", "Fuego", "es"),
          newSemanticDomain("5.5.4", "Quemar", "es"),
        ],
      }),
      mockMergeTreeSense({
        semanticDomains: [
          newSemanticDomain("5.5.4", "Burn", "es"),
          newSemanticDomain("5.5.6", "Fuel", "en"),
        ],
      }),
    ];
    combineIntoFirstSense(senses);
    const semDoms = senses[0].sense.semanticDomains;
    // Check that 2 more domains were added
    expect(semDoms).toHaveLength(3);
    // Check that the domains have the expected ids
    expect(new Set(["5.5", "5.5.4", "5.5.6"])).toEqual(
      new Set(semDoms.map((dom) => dom.id))
    );
    // Check that the initial domain wasn't replaced
    expect(semDoms.find((dom) => dom.id === "5.5")?.lang).toEqual("en");
  });

  describe("grammatical info", () => {
    it("inherits the first not-Unspecified catGroup", () => {
      const senses = [
        mockMergeTreeSense(),
        mockMergeTreeSense({
          grammaticalInfo: {
            catGroup: GramCatGroup.Unspecified,
            grammaticalCategory: "",
          },
        }),
        mockMergeTreeSense({
          grammaticalInfo: {
            catGroup: GramCatGroup.Verb,
            grammaticalCategory: "",
          },
        }),
        mockMergeTreeSense({
          grammaticalInfo: {
            catGroup: GramCatGroup.Noun,
            grammaticalCategory: "",
          },
        }),
      ];
      combineIntoFirstSense(senses);
      const catGroup = senses[0].sense.grammaticalInfo.catGroup;
      expect(catGroup).toEqual(GramCatGroup.Verb);
    });

    it("merges grammaticalCategory of the same catGroup", () => {
      const senses = [
        mockMergeTreeSense({
          grammaticalInfo: {
            catGroup: GramCatGroup.Verb,
            grammaticalCategory: "vt",
          },
        }),
        mockMergeTreeSense({
          grammaticalInfo: {
            catGroup: GramCatGroup.Verb,
            grammaticalCategory: "vi",
          },
        }),
        mockMergeTreeSense({
          grammaticalInfo: {
            catGroup: GramCatGroup.Verb,
            grammaticalCategory: "vt",
          },
        }),
        mockMergeTreeSense({
          grammaticalInfo: {
            catGroup: GramCatGroup.Verb,
            grammaticalCategory: "v",
          },
        }),
      ];
      combineIntoFirstSense(senses);
      const gramCat = senses[0].sense.grammaticalInfo.grammaticalCategory;
      expect(gramCat).toEqual("vt; vi; v");
    });
  });

  it("combines non-duplicate definitions", () => {
    const textEn1 = "a fish that flies; flying fish";
    const textEn1Contained = "flying fish";
    const textEn2 = "a species of flying fish";
    const textEs = "un pez volando";
    const senses = [
      mockMergeTreeSense({ definitions: [newDefinition(textEn1, "en")] }),
      mockMergeTreeSense({
        definitions: [newDefinition(textEn1Contained, "en")],
      }),
      mockMergeTreeSense({
        definitions: [
          newDefinition(textEs, "es"),
          newDefinition(textEn2, "en"),
        ],
      }),
    ];
    combineIntoFirstSense(senses);
    const defs = senses[0].sense.definitions;
    // Check that the non-English definition was added
    expect(defs).toHaveLength(2);
    expect(defs.map((d) => d.language)).toEqual(["en", "es"]);
    expect(defs.find((d) => d.language === "es")?.text).toEqual(textEs);
    // Check that the English definition text was extended
    expect(defs.find((d) => d.language === "en")?.text).toEqual(
      `${textEn1}; ${textEn2}`
    );
  });

  it("combines non-duplicate glosses", () => {
    const defEn1 = "flying fish; a fish that flies";
    const defEn1Contained = "flying fish";
    const defEn2 = "a species of flying fish";
    const defEs = "un pez volando";
    const senses = [
      mockMergeTreeSense({ glosses: [newGloss(defEn1Contained, "en")] }),
      mockMergeTreeSense({ glosses: [newGloss(defEn1, "en")] }),
      mockMergeTreeSense({
        glosses: [newGloss(defEs, "es"), newGloss(defEn2, "en")],
      }),
    ];
    combineIntoFirstSense(senses);
    const glosses = senses[0].sense.glosses;
    // Check that the non-English gloss was added
    expect(glosses).toHaveLength(2);
    expect(glosses.map((g) => g.language)).toEqual(["en", "es"]);
    expect(glosses.find((g) => g.language === "es")?.def).toEqual(defEs);
    // Check that the English gloss def was extended
    expect(glosses.find((g) => g.language === "en")?.def).toEqual(
      `${defEn1}; ${defEn2}`
    );
  });
});
