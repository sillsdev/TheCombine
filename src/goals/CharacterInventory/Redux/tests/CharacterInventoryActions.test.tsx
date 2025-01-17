import { type Action } from "redux";

import { type Project, type Word } from "api/models";
import {
  type CharInvChanges,
  type CharacterChange,
  CharacterStatus,
  type FindAndReplaceChange,
  defaultCharInvChanges,
} from "goals/CharacterInventory/CharacterInventoryTypes";
import {
  fetchWords,
  findAndReplace,
  getAllCharacters,
  getCharChanges,
  loadCharInvData,
  setCharacterStatus,
  uploadInventory,
} from "goals/CharacterInventory/Redux/CharacterInventoryActions";
import {
  type CharacterInventoryState,
  type CharacterSetEntry,
} from "goals/CharacterInventory/Redux/CharacterInventoryReduxTypes";
import { type RootState, setupStore } from "rootRedux/store";
import { persistedDefaultState } from "rootRedux/testTypes";
import { newProject } from "types/project";
import { newWord } from "types/word";

jest.mock("backend", () => ({
  getFrontierWords: (...args: any[]) => mockGetFrontierWords(...args),
  updateWord: (word: Word) => mockUpdateWord(word),
}));
jest.mock("components/Project/ProjectActions", () => ({
  asyncUpdateCurrentProject: (...args: any[]) =>
    mockAsyncUpdateCurrentProject(...args),
}));
jest.mock("goals/Redux/GoalActions", () => ({
  asyncUpdateGoal: () => mockAsyncUpdateGoal(),
  addCharInvChangesToGoal: (changes: CharInvChanges) =>
    mockAddCharInvChangesToGoal(changes),
}));

const mockAddCharInvChangesToGoal = jest.fn();
const mockAsyncUpdateCurrentProject = jest.fn();
const mockAsyncUpdateGoal = jest.fn();
const mockGetFrontierWords = jest.fn();
const mockUpdateWord = jest.fn();

const bumpId = (id: string): string => `${id}++`;
const mockAction: Action = { type: "" };
const setMockFunctions = (): void => {
  mockAddCharInvChangesToGoal.mockReturnValue(mockAction);
  mockAsyncUpdateCurrentProject.mockReturnValue(mockAction);
  mockAsyncUpdateGoal.mockReturnValue(mockAction);
  // Set mockGetFrontierWords specifically for each tests.
  mockUpdateWord.mockImplementation((w: Word) => ({ ...w, id: bumpId(w.id) }));
};

beforeEach(() => {
  jest.resetAllMocks();
  setMockFunctions();
});

describe("CharacterInventoryActions", () => {
  describe("setCharacterStatus", () => {
    const character = "C";
    const mockState = (status: CharacterStatus): RootState => {
      const entry: CharacterSetEntry = { character, occurrences: 0, status };
      const rej = status === CharacterStatus.Rejected ? [character] : [];
      const val = status === CharacterStatus.Accepted ? [character] : [];
      return {
        ...persistedDefaultState,
        characterInventoryState: {
          ...persistedDefaultState.characterInventoryState,
          characterSet: [entry],
          rejectedCharacters: rej,
          validCharacters: val,
        },
      };
    };

    it("changes character from Rejected to Accepted", () => {
      const store = setupStore(mockState(CharacterStatus.Rejected));
      store.dispatch(setCharacterStatus(character, CharacterStatus.Accepted));
      const state = store.getState().characterInventoryState;
      expect(state.characterSet[0].status).toEqual(CharacterStatus.Accepted);
      expect(state.rejectedCharacters).toHaveLength(0);
      expect(state.validCharacters).toHaveLength(1);
      expect(state.validCharacters[0]).toEqual(character);
    });

    it("changes character from Accepted to Undecided", () => {
      const store = setupStore(mockState(CharacterStatus.Accepted));
      store.dispatch(setCharacterStatus(character, CharacterStatus.Undecided));
      const state = store.getState().characterInventoryState;
      expect(state.characterSet[0].status).toEqual(CharacterStatus.Undecided);
      expect(state.rejectedCharacters).toHaveLength(0);
      expect(state.validCharacters).toHaveLength(0);
    });

    it("changes character from Undecided to Rejected", () => {
      const store = setupStore(mockState(CharacterStatus.Undecided));
      store.dispatch(setCharacterStatus(character, CharacterStatus.Rejected));
      const state = store.getState().characterInventoryState;
      expect(state.characterSet[0].status).toEqual(CharacterStatus.Rejected);
      expect(state.rejectedCharacters).toHaveLength(1);
      expect(state.rejectedCharacters[0]).toEqual(character);
      expect(state.validCharacters).toHaveLength(0);
    });
  });

  describe("uploadInventory", () => {
    it("dispatches no actions if there are no changes", async () => {
      const store = setupStore();
      await store.dispatch(uploadInventory());
      expect(mockAddCharInvChangesToGoal).not.toHaveBeenCalled();
      expect(mockAsyncUpdateCurrentProject).not.toHaveBeenCalled();
      expect(mockAsyncUpdateGoal).not.toHaveBeenCalled();
    });

    it("dispatches correct action if there are changes", async () => {
      // Mock data with distinct characters
      const rejectedCharacters = ["r", "e", "j"];
      const validCharacters = ["v", "a", "l", "i", "d"];
      const store = setupStore({
        ...persistedDefaultState,
        characterInventoryState: {
          ...persistedDefaultState.characterInventoryState,
          rejectedCharacters,
          validCharacters,
        },
      });

      await store.dispatch(uploadInventory());
      expect(mockAddCharInvChangesToGoal).toHaveBeenCalledTimes(1);
      expect(
        mockAddCharInvChangesToGoal.mock.calls[0][0].charChanges
      ).toHaveLength(rejectedCharacters.length + validCharacters.length);
      expect(mockAsyncUpdateCurrentProject).toHaveBeenCalledTimes(1);
      const proj: Project = mockAsyncUpdateCurrentProject.mock.calls[0][0];
      expect(proj.rejectedCharacters).toHaveLength(rejectedCharacters.length);
      rejectedCharacters.forEach((c) =>
        expect(proj.rejectedCharacters).toContain(c)
      );
      expect(proj.validCharacters).toHaveLength(validCharacters.length);
      validCharacters.forEach((c) => expect(proj.validCharacters).toContain(c));
      expect(mockAsyncUpdateGoal).toHaveBeenCalledTimes(1);
    });
  });

  describe("fetchWords", () => {
    it("correctly affects state", async () => {
      const store = setupStore();
      const verns = ["v1", "v2", "v3", "v4"];
      mockGetFrontierWords.mockResolvedValueOnce(verns.map((v) => newWord(v)));
      await store.dispatch(fetchWords());
      const { allWords } = store.getState().characterInventoryState;
      expect(allWords).toHaveLength(verns.length);
      verns.forEach((v) => expect(allWords).toContain(v));
    });
  });

  describe("getAllCharacters", () => {
    it("correctly affects state", async () => {
      const store = setupStore({
        ...persistedDefaultState,
        characterInventoryState: {
          ...persistedDefaultState.characterInventoryState,
          // Words containing the characters 1 through 9
          allWords: ["123", "45246", "735111189"],
        },
      });
      await store.dispatch(getAllCharacters());
      const { characterSet } = store.getState().characterInventoryState;
      expect(characterSet).toHaveLength(9);
      const chars = characterSet.map((char) => char.character);
      [..."123456789"].forEach((c) => expect(chars).toContain(c));
    });
  });

  describe("loadCharInvData", () => {
    it("correctly affects state", async () => {
      // Mock data with distinct characters
      const mockVern = "1234";
      const rejectedCharacters = ["r", "e", "j"];
      const validCharacters = ["v", "a", "l", "i", "d"];

      const store = setupStore({
        ...persistedDefaultState,
        currentProjectState: {
          ...persistedDefaultState.currentProjectState,
          project: { ...newProject(), rejectedCharacters, validCharacters },
        },
      });
      mockGetFrontierWords.mockResolvedValueOnce([newWord(mockVern)]);
      await store.dispatch(loadCharInvData());
      const state = store.getState().characterInventoryState;

      expect(state.allWords).toHaveLength(1);
      expect(state.allWords[0]).toEqual(mockVern);

      expect(state.characterSet).toHaveLength(mockVern.length);
      const chars = state.characterSet.map((char) => char.character);
      [...mockVern].forEach((c) => expect(chars).toContain(c));

      expect(state.rejectedCharacters).toHaveLength(rejectedCharacters.length);
      rejectedCharacters.forEach((c) =>
        expect(state.rejectedCharacters).toContain(c)
      );

      expect(state.validCharacters).toHaveLength(validCharacters.length);
      validCharacters.forEach((c) =>
        expect(state.validCharacters).toContain(c)
      );
    });
  });

  describe("findAndReplace", () => {
    it("does nothing if no words changed", async () => {
      const store = setupStore();
      const word: Word = { ...newWord("bcd"), id: "mock-id" };
      mockGetFrontierWords.mockResolvedValue([word]);

      await store.dispatch(findAndReplace("A", "a"));
      expect(mockGetFrontierWords).toHaveBeenCalledTimes(1);
      expect(mockUpdateWord).not.toHaveBeenCalled();
      expect(mockAddCharInvChangesToGoal).not.toHaveBeenCalled();
      expect(mockAsyncUpdateGoal).not.toHaveBeenCalled();
    });

    it("acts when words changed", async () => {
      const store = setupStore();
      const word: Word = { ...newWord("Abc"), id: "mock-id" };
      mockGetFrontierWords.mockResolvedValue([word]);

      await store.dispatch(findAndReplace("A", "a"));
      expect(mockGetFrontierWords).toHaveBeenCalledTimes(2);
      expect(mockUpdateWord).toHaveBeenCalledTimes(1);
      expect(mockAddCharInvChangesToGoal).toHaveBeenCalledTimes(1);
      expect(mockAsyncUpdateGoal).toHaveBeenCalledTimes(1);
      expect(store.getState().characterInventoryState.allWords).toEqual([
        "abc",
      ]);
    });

    it("appends word changes", async () => {
      const prevWordChanges: FindAndReplaceChange = {
        find: "Q",
        replace: "q",
        words: { ["old"]: "new" },
      };
      const store = setupStore({
        ...persistedDefaultState,
        goalsState: {
          ...persistedDefaultState.goalsState,
          currentGoal: {
            ...persistedDefaultState.goalsState.currentGoal,
            changes: {
              ...defaultCharInvChanges,
              wordChanges: [prevWordChanges],
            },
          },
        },
      });
      const word: Word = { ...newWord("Abc"), id: "mock-id" };
      mockGetFrontierWords.mockResolvedValue([word]);

      await store.dispatch(findAndReplace("A", "a"));
      expect(mockAddCharInvChangesToGoal).toHaveBeenCalledTimes(1);
      const newWordChanges: FindAndReplaceChange = {
        find: "A",
        replace: "a",
        words: { [word.id]: bumpId(word.id) },
      };
      expect(mockAddCharInvChangesToGoal).toHaveBeenCalledWith({
        ...defaultCharInvChanges,
        wordChanges: [prevWordChanges, newWordChanges],
      });
    });
  });

  describe("getCharChanges", () => {
    it("returns correct changes", () => {
      const accAcc = "accepted";
      const accRej = "accepted->rejected";
      const accUnd = "accepted->undecided";
      const rejAcc = "rejected->accepted";
      const rejRej = "rejected";
      const rejUnd = "rejected->undecided";
      const undAcc = "undecided->accepted";
      const undRej = "undecided->rejected";
      const oldProj = {
        ...newProject(),
        validCharacters: [accAcc, accRej, accUnd],
        rejectedCharacters: [rejAcc, rejRej, rejUnd],
      };
      const charInvState: CharacterInventoryState = {
        ...persistedDefaultState.characterInventoryState,
        validCharacters: [accAcc, rejAcc, undAcc],
        rejectedCharacters: [accRej, rejRej, undRej],
      };
      const expectedChanges: CharacterChange[] = [
        [accRej, CharacterStatus.Accepted, CharacterStatus.Rejected],
        [accUnd, CharacterStatus.Accepted, CharacterStatus.Undecided],
        [rejAcc, CharacterStatus.Rejected, CharacterStatus.Accepted],
        [rejUnd, CharacterStatus.Rejected, CharacterStatus.Undecided],
        [undAcc, CharacterStatus.Undecided, CharacterStatus.Accepted],
        [undRej, CharacterStatus.Undecided, CharacterStatus.Rejected],
      ];
      const charChanges = getCharChanges(oldProj, charInvState);
      expect(charChanges.length).toEqual(expectedChanges.length);
      expectedChanges.forEach((ch) => expect(charChanges).toContainEqual(ch));
    });
  });
});
