import type { PreloadedState } from "@reduxjs/toolkit";
import { Definition, SemanticDomain, Word } from "api/models";
import { defaultState } from "components/App/DefaultState";
import {
  convertSenseToMergeTreeSense,
  convertWordToMergeTreeWord,
  newMergeTreeWord,
} from "goals/MergeDuplicates/MergeDupsTreeTypes";
import { MergeDupsData } from "goals/MergeDuplicates/MergeDupsTypes";
import { RootState } from "store";
import { newSense, newWord, simpleWord } from "types/word";

const wordsArrayMock = (): Word[] => [
  // Each simpleWord() has a randomly generated id
  simpleWord("", ""),
  simpleWord("", ""),
  simpleWord("", ""),
  simpleWord("", ""),
  simpleWord("", ""),
  simpleWord("", ""),
  simpleWord("", ""),
  simpleWord("", ""),
];

export const goalDataMock: MergeDupsData = {
  plannedWords: [
    wordsArrayMock(),
    wordsArrayMock(),
    wordsArrayMock(),
    wordsArrayMock(),
    wordsArrayMock(),
    wordsArrayMock(),
    wordsArrayMock(),
    wordsArrayMock(),
  ],
};

// Words/Senses to be used for a preloaded mergeDuplicateGoal state
// in the unit tests for MergeDuplicates Actions/Reducer
const semDomSocial: SemanticDomain = {
  guid: "00000000-0000-0000-0000-000000000000",
  name: "Social behavior",
  id: "4",
  lang: "",
};

const semDomLanguage: SemanticDomain = {
  guid: "00000000-0000-0000-0000-000000000000",
  name: "Language and thought",
  id: "3",
  lang: "",
};

const definitionBah = { language: "en", text: "defBah" };
const definitionBag = { language: "en", text: "defBag" };
const definitionBagBah = { language: "en", text: "defBag;defBah" };

const senseBag = {
  ...newSense("bag"),
  guid: "guid-sense-bag",
  semanticDomains: [semDomLanguage],
  definitions: [definitionBag],
};
const senseBah = {
  ...newSense("bah"),
  guid: "guid-sense-bah",
  semanticDomains: [semDomSocial],
  definitions: [definitionBah],
};
const senseBar = {
  ...newSense("bar"),
  guid: "guid-sense-bar",
  semanticDomains: [semDomLanguage],
};
const senseBaz = { ...newSense("baz"), guid: "guid-sense-baz" };

const wordFoo1 = { ...newWord("foo"), id: "wordId-foo1", senses: [senseBah] };
const wordFoo2 = {
  ...newWord("foo"),
  id: "wordId-foo2",
  senses: [senseBar, senseBaz],
};

// Preloaded values for store when testing the MergeDups Goal
const persistedDefaultState: PreloadedState<RootState> = {
  ...defaultState,
  _persist: { version: 1, rehydrated: false },
};

export type ExpectedScenarioResult = {
  // wordId for the parent word
  parent: string;
  // sense guids in the parent word
  senses: string[];
  // semantic domain ids in the parent word
  semDoms: string[];
  // definitions in the merged sense
  defs: Definition[][];
  // child source word ids
  children: string[];
};

export type GetMergeWordsScenario = {
  initialState: () => PreloadedState<RootState>;
  expectedResult: ExpectedScenarioResult[];
};

// Scenario:
//   Word1:
//     vern: foo
//     senses: bah
//
//   Word2:
//     vern: foo
//     senses: bar, baz
//
//  Sense "bah" is dragged to "Word2" as an additional sense
export const mergeTwoWordsScenario: GetMergeWordsScenario = {
  initialState: () => {
    return {
      ...persistedDefaultState,
      mergeDuplicateGoal: {
        data: {
          senses: {
            "guid-sense-bah": convertSenseToMergeTreeSense(
              senseBah,
              wordFoo1.id,
              0
            ),
            "guid-sense-bar": convertSenseToMergeTreeSense(
              senseBar,
              wordFoo2.id,
              0
            ),
            "guid-sense-baz": convertSenseToMergeTreeSense(
              senseBaz,
              wordFoo2.id,
              1
            ),
          },
          words: {
            "wordId-foo1": wordFoo1,
            "wordId-foo2": wordFoo2,
          },
        },
        tree: {
          sidebar: {
            senses: [],
            wordId: "",
            mergeSenseId: "",
          },
          words: {
            "wordId-foo2": convertWordToMergeTreeWord({
              ...wordFoo2,
              senses: [senseBar, senseBaz, senseBah],
            }),
          },
        },
        mergeWords: [],
      },
    };
  },
  expectedResult: [
    {
      parent: "wordId-foo2",
      senses: ["guid-sense-bah", "guid-sense-bar", "guid-sense-baz"],
      semDoms: ["3", "4"],
      defs: [[], [], [definitionBah]],
      children: ["wordId-foo1", "wordId-foo2"],
    },
  ],
};

// Scenario:
//   Word1:
//     vern: foo
//     senses: bah
//
//   Word2:
//     vern: foo
//     senses: bar, baz
//
//  Sense "bah" is dragged to Word2 and merged with sense "bar"
export const mergeTwoSensesScenario: GetMergeWordsScenario = {
  initialState: () => {
    return {
      ...persistedDefaultState,
      mergeDuplicateGoal: {
        data: {
          senses: {
            "guid-sense-bah": convertSenseToMergeTreeSense(
              senseBah,
              wordFoo1.id,
              0
            ),
            "guid-sense-bar": convertSenseToMergeTreeSense(
              senseBar,
              wordFoo2.id,
              0
            ),
            "guid-sense-baz": convertSenseToMergeTreeSense(
              senseBaz,
              wordFoo2.id,
              1
            ),
          },
          words: {
            "wordId-foo1": wordFoo1,
            "wordId-foo2": wordFoo2,
          },
        },
        tree: {
          sidebar: {
            senses: [],
            wordId: "",
            mergeSenseId: "",
          },
          words: {
            "wordId-foo2": newMergeTreeWord(wordFoo2.vernacular, {
              word2_senseA: [senseBar.guid],
              word2_senseB: [senseBaz.guid, senseBah.guid],
            }),
          },
        },
        mergeWords: [],
      },
    };
  },
  expectedResult: [
    {
      parent: "wordId-foo2",
      senses: ["guid-sense-bar", "guid-sense-baz"],
      semDoms: ["3", "4"],
      defs: [[], [definitionBah]],
      children: ["wordId-foo1", "wordId-foo2"],
    },
  ],
};

// Scenario:
//   Word1:
//     vern: foo
//     senses: bah
//
//   Word2:
//     vern: foo
//     senses: bar, bag
//
//  Sense "bah" is dragged to Word2 and merged with sense "bag"
export const mergeTwoDefinitionsScenario: GetMergeWordsScenario = {
  initialState: () => {
    return {
      ...persistedDefaultState,
      mergeDuplicateGoal: {
        data: {
          senses: {
            "guid-sense-bah": convertSenseToMergeTreeSense(
              senseBah,
              wordFoo1.id,
              0
            ),
            "guid-sense-bar": convertSenseToMergeTreeSense(
              senseBar,
              wordFoo2.id,
              0
            ),
            "guid-sense-bag": convertSenseToMergeTreeSense(
              senseBag,
              wordFoo2.id,
              1
            ),
          },
          words: {
            "wordId-foo1": wordFoo1,
            "wordId-foo2": { ...wordFoo2, senses: [senseBar, senseBag] },
          },
        },
        tree: {
          sidebar: {
            senses: [],
            wordId: "",
            mergeSenseId: "",
          },
          words: {
            "wordId-foo2": newMergeTreeWord(wordFoo2.vernacular, {
              word2_senseA: [senseBar.guid],
              word2_senseB: [senseBag.guid, senseBah.guid],
            }),
          },
        },
        mergeWords: [],
      },
    };
  },
  expectedResult: [
    {
      parent: "wordId-foo2",
      senses: ["guid-sense-bag", "guid-sense-bar"],
      semDoms: ["3", "3", "4"],
      defs: [[], [definitionBagBah]],
      children: ["wordId-foo1", "wordId-foo2"],
    },
  ],
};
