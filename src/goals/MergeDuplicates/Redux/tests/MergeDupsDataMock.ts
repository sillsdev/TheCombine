import { type Definition, type SemanticDomain, type Word } from "api/models";
import {
  convertSenseToMergeTreeSense,
  convertWordToMergeTreeWord,
  defaultTree,
  newMergeTreeWord,
} from "goals/MergeDuplicates/MergeDupsTreeTypes";
import { type MergeDupsData } from "goals/MergeDuplicates/MergeDupsTypes";
import { defaultState as mergeState } from "goals/MergeDuplicates/Redux/MergeDupsReduxTypes";
import { type RootState } from "rootRedux/store";
import { persistedDefaultState } from "rootRedux/testTypes";
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
const definitionBagBah = { language: "en", text: "defBag; defBah" };

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
  initialState: () => RootState;
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
        ...mergeState,
        data: {
          senses: {
            [senseBah.guid]: convertSenseToMergeTreeSense(
              senseBah,
              wordFoo1.id,
              0
            ),
            [senseBar.guid]: convertSenseToMergeTreeSense(
              senseBar,
              wordFoo2.id,
              0
            ),
            [senseBaz.guid]: convertSenseToMergeTreeSense(
              senseBaz,
              wordFoo2.id,
              1
            ),
          },
          words: {
            [wordFoo1.id]: wordFoo1,
            [wordFoo2.id]: wordFoo2,
          },
        },
        tree: {
          ...defaultTree,
          words: {
            [wordFoo2.id]: convertWordToMergeTreeWord({
              ...wordFoo2,
              senses: [senseBar, senseBaz, senseBah],
            }),
          },
        },
      },
    };
  },
  expectedResult: [
    {
      parent: wordFoo2.id,
      senses: [senseBah.guid, senseBar.guid, senseBaz.guid],
      semDoms: ["3", "4"],
      defs: [[], [], [definitionBah]],
      children: [wordFoo1.id, wordFoo2.id],
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
        ...mergeState,
        data: {
          senses: {
            [senseBah.guid]: convertSenseToMergeTreeSense(
              senseBah,
              wordFoo1.id,
              0
            ),
            [senseBar.guid]: convertSenseToMergeTreeSense(
              senseBar,
              wordFoo2.id,
              0
            ),
            [senseBaz.guid]: convertSenseToMergeTreeSense(
              senseBaz,
              wordFoo2.id,
              1
            ),
          },
          words: {
            [wordFoo1.id]: wordFoo1,
            [wordFoo2.id]: wordFoo2,
          },
        },
        tree: {
          ...defaultTree,
          words: {
            [wordFoo2.id]: newMergeTreeWord(wordFoo2.vernacular, {
              word2_senseA: [senseBar.guid],
              word2_senseB: [senseBaz.guid, senseBah.guid],
            }),
          },
        },
      },
    };
  },
  expectedResult: [
    {
      parent: wordFoo2.id,
      senses: [senseBar.guid, senseBaz.guid],
      semDoms: ["3", "4"],
      defs: [[], [definitionBah]],
      children: [wordFoo1.id, wordFoo2.id],
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
        ...mergeState,
        data: {
          senses: {
            [senseBah.guid]: convertSenseToMergeTreeSense(
              senseBah,
              wordFoo1.id,
              0
            ),
            [senseBar.guid]: convertSenseToMergeTreeSense(
              senseBar,
              wordFoo2.id,
              0
            ),
            [senseBag.guid]: convertSenseToMergeTreeSense(
              senseBag,
              wordFoo2.id,
              1
            ),
          },
          words: {
            [wordFoo1.id]: wordFoo1,
            [wordFoo2.id]: { ...wordFoo2, senses: [senseBar, senseBag] },
          },
        },
        tree: {
          ...defaultTree,
          words: {
            [wordFoo2.id]: newMergeTreeWord(wordFoo2.vernacular, {
              word2_senseA: [senseBar.guid],
              word2_senseB: [senseBag.guid, senseBah.guid],
            }),
          },
        },
      },
    };
  },
  expectedResult: [
    {
      parent: wordFoo2.id,
      senses: [senseBag.guid, senseBar.guid],
      semDoms: ["3", "3", "4"],
      defs: [[], [definitionBagBah]],
      children: [wordFoo1.id, wordFoo2.id],
    },
  ],
};
