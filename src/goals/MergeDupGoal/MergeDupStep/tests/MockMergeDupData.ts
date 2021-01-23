import { simpleWord } from "types/word";
import { MergeDupData } from "goals/MergeDupGoal/MergeDups";

const wordsArrayMock = () => [
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

export const goalDataMock: MergeDupData = {
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
