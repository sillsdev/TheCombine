import configureMockStore, { MockStoreEnhanced } from "redux-mock-store";
import thunk from "redux-thunk";

import { updateProject } from "backend";
import * as LocalStorage from "backend/localStorage";
import { SET_CURRENT_PROJECT } from "components/Project/ProjectActions";
import * as Actions from "goals/CharInventoryCreation/CharacterInventoryActions";
import {
  CharacterInventoryState,
  CharacterSetEntry,
  CharacterStatus,
  defaultState,
} from "goals/CharInventoryCreation/CharacterInventoryReducer";
import { StoreState } from "types";
import { defaultProject } from "types/project";
import { User } from "types/user";
import { Goal } from "types/goals";
import { Action } from "redux";

const VALID_DATA: string[] = ["a", "b"];
const REJECT_DATA: string[] = ["y", "z"];
const CHARACTER_SET_DATA: CharacterSetEntry[] = [
  {
    character: "a",
    status: CharacterStatus.Accepted,
    occurrences: 0,
  },
  {
    character: "b",
    status: CharacterStatus.Accepted,
    occurrences: 0,
  },
  {
    character: "y",
    status: CharacterStatus.Rejected,
    occurrences: 0,
  },
  {
    character: "z",
    status: CharacterStatus.Rejected,
    occurrences: 0,
  },
  {
    character: "m",
    status: CharacterStatus.Undecided,
    occurrences: 0,
  },
];
const MOCK_STATE = {
  currentProject: {
    characterSet: [],
    rejectedCharacters: [],
    validCharacters: [],
  },
  characterInventoryState: {
    characterSet: CHARACTER_SET_DATA,
    rejectedCharacters: REJECT_DATA,
    validCharacters: VALID_DATA,
  },
};

let oldProjectId: string;
let oldUser: User | undefined;
const mockProjectId = "123";
const mockUserEditId = "456";
const mockUserId = "789";
let mockUser = new User("", "", "");
mockUser.id = mockUserId;
mockUser.workedProjects[mockProjectId] = mockUserEditId;

jest.mock("backend");
jest.mock("components/GoalTimeline/GoalsActions", () => ({
  asyncUpdateOrAddGoal: (goal: Goal) => mockAsyncUpdateOrAddGoal(goal),
}));
const mockAsyncUpdateOrAddGoal = jest.fn();

const createMockStore = configureMockStore([thunk]);
const mockStore: MockStoreEnhanced<unknown, {}> = createMockStore(MOCK_STATE);

beforeAll(() => {
  // Save things in localStorage to restore once tests are done
  oldProjectId = LocalStorage.getProjectId();
  oldUser = LocalStorage.getCurrentUser();
});

beforeEach(() => {
  LocalStorage.remove(LocalStorage.LocalStorageKey.ProjectId);
  LocalStorage.remove(LocalStorage.LocalStorageKey.User);
});

afterEach(() => {
  mockStore.clearActions();
});

afterAll(() => {
  LocalStorage.setProjectId(oldProjectId);
  if (oldUser) {
    LocalStorage.setCurrentUser(oldUser);
  }
});

describe("CharacterInventoryActions", () => {
  test("setInventory yields correct action", () => {
    expect(Actions.setValidCharacters(VALID_DATA)).toEqual({
      type: Actions.CharacterInventoryType.SET_VALID_CHARACTERS,
      payload: VALID_DATA,
    });
  });

  test("uploadInventory dispatches correct action", async () => {
    // Mock out the goal-related things called by uploadInventory.
    const mockAction: Action = { type: null };
    mockAsyncUpdateOrAddGoal.mockReturnValue(mockAction);
    const mockGoal = { changes: {} } as Goal;

    LocalStorage.setCurrentUser(mockUser);
    LocalStorage.setProjectId(mockProjectId);
    let mockStore = createMockStore(MOCK_STATE);
    const mockUpload = Actions.uploadInventory(mockGoal);
    await mockUpload(
      mockStore.dispatch,
      mockStore.getState as () => StoreState
    );
    expect(updateProject).toHaveBeenCalledTimes(1);
    expect(mockStore.getActions()).toContainEqual({
      type: SET_CURRENT_PROJECT,
      payload: {
        characterSet: [],
        rejectedCharacters: REJECT_DATA,
        validCharacters: VALID_DATA,
      },
    });
  });

  test("getChanges returns correct changes", () => {
    const accAcc = "accepted";
    const accRej = "accepted->rejected";
    const accUnd = "accepted->undecided";
    const rejAcc = "rejected->accepted";
    const rejRej = "rejected";
    const rejUnd = "rejected->undecided";
    const undAcc = "undecided->accepted";
    const undRej = "undecided->rejected";
    const oldProj = {
      ...defaultProject,
      validCharacters: [accAcc, accRej, accUnd],
      rejectedCharacters: [rejAcc, rejRej, rejUnd],
    };
    const charInvState: CharacterInventoryState = {
      ...defaultState,
      validCharacters: [accAcc, rejAcc, undAcc],
      rejectedCharacters: [accRej, rejRej, undRej],
    };
    const expectedChanges: Actions.CharacterChange[] = [
      [accRej, CharacterStatus.Accepted, CharacterStatus.Rejected],
      [accUnd, CharacterStatus.Accepted, CharacterStatus.Undecided],
      [rejAcc, CharacterStatus.Rejected, CharacterStatus.Accepted],
      [rejUnd, CharacterStatus.Rejected, CharacterStatus.Undecided],
      [undAcc, CharacterStatus.Undecided, CharacterStatus.Accepted],
      [undRej, CharacterStatus.Undecided, CharacterStatus.Rejected],
    ];
    const changes = Actions.getChanges(oldProj, charInvState);
    expect(changes.length).toEqual(expectedChanges.length);
    expectedChanges.forEach((ch) => expect(changes).toContainEqual(ch));
  });
});
