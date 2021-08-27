import { MergeUndoIds, Word } from "api/models";
import { doWordsIncludeMerges } from "goals/MergeDupGoal/MergeDupComponent/MergeDupsCompleted";
import { newWord } from "types/word";

describe("doWordsIncludeMerges", () => {
  it("should return false since words don't contain each of the parentIds in merges", () => {
    const merge1: MergeUndoIds = {
      parentIds: ["merge1PId", "merge1PId2"],
      childIds: ["merge1CId1"],
    };
    const merge2: MergeUndoIds = {
      parentIds: ["merge2PId", "merge2PId2"],
      childIds: ["merge2CId1"],
    };
    const merges = [merge1, merge2];

    const words: Word[] = [newWord(), newWord(), newWord()];
    words[0].id = "merge1PId";
    words[1].id = "merge1PId2";
    words[2].id = "merge2PId";

    expect(doWordsIncludeMerges(words, merges)).toBe(false);
  });

  it("should return true since words contain each of the parentIds in merges", () => {
    const merge1: MergeUndoIds = {
      parentIds: ["merge1PId", "merge1PId2"],
      childIds: ["merge1CId1"],
    };
    const merge2: MergeUndoIds = {
      parentIds: ["merge2PId", "merge2PId2"],
      childIds: ["merge2CId1"],
    };
    const merges = [merge1, merge2];

    const words: Word[] = [newWord(), newWord(), newWord(), newWord()];
    words[0].id = "merge1PId";
    words[1].id = "merge1PId2";
    words[2].id = "merge2PId";
    words[3].id = "merge2PId2";

    expect(doWordsIncludeMerges(words, merges)).toBe(true);
  });

  it("should return true if merges is empty and words is non-empty", () => {
    const words: Word[] = [newWord(), newWord(), newWord(), newWord()];
    words[0].id = "merge1PId";
    words[1].id = "merge1PId2";
    words[2].id = "merge2PId";
    words[3].id = "merge2PId2";

    expect(doWordsIncludeMerges(words, [])).toBe(true);
  });

  it("should return false if words is empty and merges is non-empty", () => {
    const merge1: MergeUndoIds = {
      parentIds: ["merge1PId", "merge1PId2"],
      childIds: ["merge1CId1"],
    };
    const merge2: MergeUndoIds = {
      parentIds: ["merge2PId", "merge2PId2"],
      childIds: ["merge2CId1"],
    };
    const merges = [merge1, merge2];

    expect(doWordsIncludeMerges([], merges)).toBe(false);
  });

  it("should return true if both words and merges are empty", () => {
    expect(doWordsIncludeMerges([], [])).toBe(true);
  });
});
