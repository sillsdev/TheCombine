import { Action } from "redux";
import configureMockStore from "redux-mock-store";
import thunk from "redux-thunk";

import { User } from "api/models";
import { updateProject } from "backend";
import * as LocalStorage from "backend/localStorage";
import { ProjectActionType } from "components/Project/ProjectReduxTypes";
import * as Actions from "goals/CharInventoryCreation/Redux/CharacterInventoryActions";
import {
  CharacterInventoryState,
  CharacterSetEntry,
  CharacterStatus,
  CharacterInventoryType,
  CharacterChange,
} from "goals/CharInventoryCreation/Redux/CharacterInventoryReduxTypes";
import { defaultState } from "goals/CharInventoryCreation/Redux/CharacterInventoryReducer";
import { StoreState } from "types";
import { Goal } from "types/goals";
import { newProject } from "types/project";
import { newUser } from "types/user";

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
  currentProjectState: {
    project: {
      characterSet: [],
      rejectedCharacters: [],
      validCharacters: [],
    },
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
let mockUser = newUser();
mockUser.id = mockUserId;
mockUser.workedProjects[mockProjectId] = mockUserEditId;

jest.mock("backend");
jest.mock("browserHistory");
jest.mock("components/GoalTimeline/Redux/GoalActions", () => ({
  asyncUpdateGoal: (goal: Goal) => mockAsyncUpdateGoal(goal),
}));
const mockAsyncUpdateGoal = jest.fn();

const createMockStore = configureMockStore([thunk]);

beforeAll(() => {
  // Save things in localStorage to restore once tests are done
  oldProjectId = LocalStorage.getProjectId();
  oldUser = LocalStorage.getCurrentUser();
});

beforeEach(() => {
  LocalStorage.remove(LocalStorage.LocalStorageKey.ProjectId);
  LocalStorage.remove(LocalStorage.LocalStorageKey.User);
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
      type: CharacterInventoryType.SET_VALID_CHARACTERS,
      payload: VALID_DATA,
    });
  });

  test("uploadInventory dispatches correct action", async () => {
    // Mock out the goal-related things called by uploadInventory.
    const mockAction: Action = { type: null };
    mockAsyncUpdateGoal.mockReturnValue(mockAction);
    const mockGoal = { changes: {} } as Goal;

    LocalStorage.setCurrentUser(mockUser);
    LocalStorage.setProjectId(mockProjectId);
    const mockStore = createMockStore(MOCK_STATE);
    const mockUpload = Actions.uploadInventory(mockGoal);
    await mockUpload(
      mockStore.dispatch,
      mockStore.getState as () => StoreState
    );
    expect(updateProject).toHaveBeenCalledTimes(1);
    expect(mockStore.getActions()).toContainEqual({
      type: ProjectActionType.SET_CURRENT_PROJECT,
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
      ...newProject(),
      validCharacters: [accAcc, accRej, accUnd],
      rejectedCharacters: [rejAcc, rejRej, rejUnd],
    };
    const charInvState: CharacterInventoryState = {
      ...defaultState,
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
    const changes = Actions.getChanges(oldProj, charInvState);
    expect(changes.length).toEqual(expectedChanges.length);
    expectedChanges.forEach((ch) => expect(changes).toContainEqual(ch));
  });
});
