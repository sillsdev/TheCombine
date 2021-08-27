import { doWordsIncludeMerges } from "goals/MergeDupGoal/MergeDupComponent/MergeDupsCompleted";
import { MergeUndoIds, State, Word } from "api/models";

describe("convertGoalToEdit, convertEditToGoal", () => {
  it("should return false since words don't contain each of the parentIds in merges", () => {
    const merges: MergeUndoIds[] = [];
    const merge1: MergeUndoIds = {
      parentIds: ["merge1PId", "merge1PId2"],
      childIds: ["merge1CId1"],
    };
    const merge2: MergeUndoIds = {
      parentIds: ["merge2PId", "merge2PId2"],
      childIds: ["merge2CId1"],
    };
    merges.push(merge1);
    merges.push(merge2);

    const words: Word[] = [];
    const word1: Word = {
      id: "merge1PId",
      guid: "",
      vernacular: "",
      senses: [],
      audio: [],
      created: "",
      modified: "",
      accessibility: State.Active,
      history: [],
      projectId: "",
      note: { language: "", text: "" },
    };
    const word2: Word = {
      id: "merge1PId2",
      guid: "",
      vernacular: "",
      senses: [],
      audio: [],
      created: "",
      modified: "",
      accessibility: State.Active,
      history: [],
      projectId: "",
      note: { language: "", text: "" },
    };
    const word3: Word = {
      id: "merge2PId",
      guid: "",
      vernacular: "",
      senses: [],
      audio: [],
      created: "",
      modified: "",
      accessibility: State.Active,
      history: [],
      projectId: "",
      note: { language: "", text: "" },
    };
    words.push(word1);
    words.push(word2);
    words.push(word3);

    expect(doWordsIncludeMerges(words, merges)).toBe(false);
  });

  it("should return true since words contain each of the parentIds in merges", () => {
    const merges: MergeUndoIds[] = [];
    const merge1: MergeUndoIds = {
      parentIds: ["merge1PId", "merge1PId2"],
      childIds: ["merge1CId1"],
    };
    const merge2: MergeUndoIds = {
      parentIds: ["merge2PId", "merge2PId2"],
      childIds: ["merge2CId1"],
    };
    merges.push(merge1);
    merges.push(merge2);

    const words: Word[] = [];
    const word1: Word = {
      id: "merge1PId",
      guid: "",
      vernacular: "",
      senses: [],
      audio: [],
      created: "",
      modified: "",
      accessibility: State.Active,
      history: [],
      projectId: "",
      note: { language: "", text: "" },
    };
    const word2: Word = {
      id: "merge1PId2",
      guid: "",
      vernacular: "",
      senses: [],
      audio: [],
      created: "",
      modified: "",
      accessibility: State.Active,
      history: [],
      projectId: "",
      note: { language: "", text: "" },
    };
    const word3: Word = {
      id: "merge2PId",
      guid: "",
      vernacular: "",
      senses: [],
      audio: [],
      created: "",
      modified: "",
      accessibility: State.Active,
      history: [],
      projectId: "",
      note: { language: "", text: "" },
    };
    const word4: Word = {
      id: "merge2PId2",
      guid: "",
      vernacular: "",
      senses: [],
      audio: [],
      created: "",
      modified: "",
      accessibility: State.Active,
      history: [],
      projectId: "",
      note: { language: "", text: "" },
    };
    words.push(word1);
    words.push(word2);
    words.push(word3);
    words.push(word4);

    expect(doWordsIncludeMerges(words, merges)).toBe(true);
  });

  it("should return true if merges is empty and words is non-empty", () => {
    const merges: MergeUndoIds[] = [];

    const words: Word[] = [];
    const word1: Word = {
      id: "merge1PId",
      guid: "",
      vernacular: "",
      senses: [],
      audio: [],
      created: "",
      modified: "",
      accessibility: State.Active,
      history: [],
      projectId: "",
      note: { language: "", text: "" },
    };
    const word2: Word = {
      id: "merge1PId2",
      guid: "",
      vernacular: "",
      senses: [],
      audio: [],
      created: "",
      modified: "",
      accessibility: State.Active,
      history: [],
      projectId: "",
      note: { language: "", text: "" },
    };
    const word3: Word = {
      id: "merge2PId",
      guid: "",
      vernacular: "",
      senses: [],
      audio: [],
      created: "",
      modified: "",
      accessibility: State.Active,
      history: [],
      projectId: "",
      note: { language: "", text: "" },
    };
    const word4: Word = {
      id: "merge2PId2",
      guid: "",
      vernacular: "",
      senses: [],
      audio: [],
      created: "",
      modified: "",
      accessibility: State.Active,
      history: [],
      projectId: "",
      note: { language: "", text: "" },
    };
    words.push(word1);
    words.push(word2);
    words.push(word3);
    words.push(word4);

    expect(doWordsIncludeMerges(words, merges)).toBe(true);
  });

  it("should return false if words is empty and merges is non-empty", () => {
    const merges: MergeUndoIds[] = [];
    const merge1: MergeUndoIds = {
      parentIds: ["merge1PId", "merge1PId2"],
      childIds: ["merge1CId1"],
    };
    const merge2: MergeUndoIds = {
      parentIds: ["merge2PId", "merge2PId2"],
      childIds: ["merge2CId1"],
    };
    merges.push(merge1);
    merges.push(merge2);

    const words: Word[] = [];

    expect(doWordsIncludeMerges(words, merges)).toBe(false);
  });

  it("should return true if both words and merges are empty", () => {
    const merges: MergeUndoIds[] = [];
    const merge1: MergeUndoIds = {
      parentIds: ["merge1PId", "merge1PId2"],
      childIds: ["merge1CId1"],
    };
    const merge2: MergeUndoIds = {
      parentIds: ["merge2PId", "merge2PId2"],
      childIds: ["merge2CId1"],
    };
    merges.push(merge1);
    merges.push(merge2);

    const words: Word[] = [];

    expect(doWordsIncludeMerges(words, merges)).toBe(false);
  });
});
