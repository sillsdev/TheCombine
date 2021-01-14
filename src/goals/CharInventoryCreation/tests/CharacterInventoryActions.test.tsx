import configureMockStore, { MockStoreEnhanced } from "redux-mock-store";
import thunk from "redux-thunk";

import * as backend from "../../../backend";
import * as LocalStorage from "../../../backend/localStorage";
import { GoalsActions } from "../../../components/GoalTimeline/GoalsActions";
import { SET_CURRENT_PROJECT } from "../../../components/Project/ProjectActions";
import { StoreState } from "../../../types";
import { Goal } from "../../../types/goals";
import { Project } from "../../../types/project";
import { User } from "../../../types/user";
import { CreateCharInv } from "../../CreateCharInv/CreateCharInv";
import {
  CharacterInventoryType,
  setValidCharacters,
  uploadInventory,
} from "../CharacterInventoryActions";
import { CharacterSetEntry } from "../CharacterInventoryReducer";

const VALID_DATA: string[] = ["a", "b"];
const REJECT_DATA: string[] = ["y", "z"];
const CHARACTER_SET_DATA: CharacterSetEntry[] = [
  {
    character: "a",
    status: "accepted",
    occurrences: 0,
  },
  {
    character: "b",
    status: "accepted",
    occurrences: 0,
  },
  {
    character: "y",
    status: "rejected",
    occurrences: 0,
  },
  {
    character: "z",
    status: "rejected",
    occurrences: 0,
  },
  {
    character: "m",
    status: "undecided",
    occurrences: 0,
  },
];
const goal: CreateCharInv = new CreateCharInv();
const MOCK_STATE = {
  goalsState: {
    historyState: {
      history: [goal],
    },
  },
  currentProject: {
    characterSet: null,
  },
  characterInventoryState: {
    validCharacters: VALID_DATA,
    rejectedCharacters: REJECT_DATA,
    characterSet: CHARACTER_SET_DATA,
  },
};

let oldProjectId: string;
let oldUser: User | null;
const mockProjectId: string = "12345";
const mockUserEditId: string = "23456";
const mockUserId: string = "34456";
let mockUser: User = new User("", "", "");
mockUser.id = mockUserId;
mockUser.workedProjects[mockProjectId] = mockUserEditId;

jest.mock("../../../backend", () => ({
  updateProject: jest.fn((_project: Project) => {
    return Promise.resolve("projectId");
  }),
  addStepToGoal: jest.fn(() => {
    return Promise.resolve(mockGoal);
  }),
}));

const mockGoal: Goal = new CreateCharInv();

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

describe("Testing CharacterInventoryActions", () => {
  test("setInventory yields correct action", () => {
    expect(setValidCharacters(VALID_DATA)).toEqual({
      type: CharacterInventoryType.SET_VALID_CHARACTERS,
      payload: VALID_DATA,
    });
  });

  test("uploadInventory dispatches correct actions", async () => {
    LocalStorage.setCurrentUser(mockUser);
    LocalStorage.setProjectId(mockProjectId);
    let mockStore = createMockStore(MOCK_STATE);
    const mockUpload = uploadInventory();
    await mockUpload(
      mockStore.dispatch,
      mockStore.getState as () => StoreState
    );

    const updatedGoal: CreateCharInv = goal;
    updatedGoal.data = {
      inventory: [[...MOCK_STATE.characterInventoryState.validCharacters]],
    };
    expect(backend.updateProject).toHaveBeenCalledTimes(1);
    expect(backend.addStepToGoal).toHaveBeenCalledTimes(1);
    expect(mockStore.getActions()).toEqual([
      {
        type: GoalsActions.UPDATE_GOAL,
        payload: [updatedGoal],
      },
      {
        type: SET_CURRENT_PROJECT,
        payload: {
          characterSet: null,
          validCharacters: VALID_DATA,
          rejectedCharacters: REJECT_DATA,
        },
      },
    ]);
  });
});
