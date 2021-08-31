import { MergeUndoIds, Word } from "api/models";
import { doWordsIncludeMerges } from "goals/MergeDupGoal/MergeDupComponent/MergeDupsCompleted";
import { newWord } from "types/word";

describe("doWordsIncludeMerges", () => {
  it("should return false if words doesn't contain all of the parentIds in merge", () => {
    const merge: MergeUndoIds = {
      parentIds: ["mergePId", "mergePId2"],
      childIds: ["mergeCId1"],
    };

    const words: Word[] = [newWord()];
    words[0].id = merge.parentIds[0];

    expect(doWordsIncludeMerges(words, merge)).toBe(false);
  });

  it("should return true if words contains all the parentIds in merge", () => {
    const merge: MergeUndoIds = {
      parentIds: ["mergePId", "mergePId2"],
      childIds: ["mergeCId1"],
    };

    const words: Word[] = [newWord(), newWord()];
    words[0].id = merge.parentIds[0];
    words[1].id = merge.parentIds[1];

    expect(doWordsIncludeMerges(words, merge)).toBe(true);
  });

  it("should return true if merge is empty and words is non-empty", () => {
    const merge: MergeUndoIds = {
      parentIds: [],
      childIds: [],
    };
    const words: Word[] = [newWord(), newWord()];
    words[0].id = "mergePId";
    words[1].id = "mergePId2";

    expect(doWordsIncludeMerges(words, merge)).toBe(true);
  });

  it("should return false if words is empty and merge is non-empty", () => {
    const merge: MergeUndoIds = {
      parentIds: ["mergePId", "merge1PId2"],
      childIds: ["mergeCId1"],
    };

    expect(doWordsIncludeMerges([], merge)).toBe(false);
  });

  it("should return true if both words and merge are empty", () => {
    const merge: MergeUndoIds = {
      parentIds: [],
      childIds: [],
    };
    expect(doWordsIncludeMerges([], merge)).toBe(true);
  });
});
