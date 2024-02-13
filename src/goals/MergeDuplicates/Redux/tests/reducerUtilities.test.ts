import { v4 } from "uuid";

import { type Word } from "api/models";
import {
  type MergeTreeWord,
  convertWordToMergeTreeWord,
} from "goals/MergeDuplicates/MergeDupsTreeTypes";
import { getAudioMoves } from "goals/MergeDuplicates/Redux/reducerUtilities";
import { type Hash } from "types/hash";
import { newSense, newWord } from "types/word";

const wordA = newWord("1 sense");
wordA.id = "wA";
const senseA0 = newSense("A0");
wordA.senses = [senseA0];

const wordB = newWord("2 senses");
wordB.id = "wB";
const senseB0 = newSense("B0");
const senseB1 = newSense("B1");
wordB.senses = [senseB0, senseB1];

const wordC = newWord("3 senses");
wordC.id = "wC";
const senseC0 = newSense("C0");
const senseC1 = newSense("C1");
const senseC2 = newSense("C2");
wordC.senses = [senseC0, senseC1, senseC2];

const dataWords: Hash<Word> = {
  [wordA.id]: wordA,
  [wordB.id]: wordB,
  [wordC.id]: wordC,
};

describe("getAudioMoves", () => {
  it("handles all a words senses being moved", () => {
    const newWordId = "new-word-id";
    const treeWords: Hash<MergeTreeWord> = {
      [wordA.id]: convertWordToMergeTreeWord(wordA),
      [wordB.id]: convertWordToMergeTreeWord(wordA),
      [newWordId]: convertWordToMergeTreeWord(newWord()),
    };

    // Add the first of C's senses as a duplicate to A's only sense.
    const guidsA = treeWords[wordA.id].sensesGuids;
    guidsA[Object.keys(guidsA)[0]].push(senseC0.guid);

    // Add the second of C's senses as another sense to B.
    treeWords[wordB.id].sensesGuids[v4()] = [senseC1.guid];

    // Add the third of C's senses to a new word.
    treeWords[newWordId].sensesGuids = { [v4()]: [senseC2.guid] };

    // Confirm moving audio of C to both B and the new word,
    // but not to A, since C's sense there is a duplicate.
    const audioMoves = getAudioMoves(dataWords, treeWords);
    expect(audioMoves).toEqual({
      [wordB.id]: [wordC.id],
      [newWordId]: [wordC.id],
    });
  });

  it("considers duplicate senses when no primary senses", () => {
    const treeWords: Hash<MergeTreeWord> = {
      [wordA.id]: convertWordToMergeTreeWord(wordA),
      [wordC.id]: convertWordToMergeTreeWord(wordC),
    };

    // Add the first of B's senses as a duplicate to A's only sense.
    const guidsA = treeWords[wordA.id].sensesGuids;
    guidsA[Object.keys(guidsA)[0]].push(senseB0.guid);

    // Add the second of B's senses as a duplicate to one of C's senses.
    const guidsC = treeWords[wordC.id].sensesGuids;
    guidsC[Object.keys(guidsC)[1]].push(senseB1.guid);

    // Confirm moving audio of B to both A and C.
    const audioMoves = getAudioMoves(dataWords, treeWords);
    expect(audioMoves).toEqual({
      [wordA.id]: [wordB.id],
      [wordC.id]: [wordB.id],
    });
  });
});
