import {
  setValidCharacters,
  SET_VALID_CHARACTERS,
  uploadInventory
} from "../CharacterInventoryActions";
import configureMockStore, { MockStoreEnhanced } from "redux-mock-store";
import thunk from "redux-thunk";
import { StoreState } from "../../../types";
import axios from "axios";
import { SET_CURRENT_PROJECT } from "../../../components/Project/ProjectActions";
import { GoalsActions } from "../../../components/GoalTimeline/GoalsActions";
import { CreateCharInv } from "../../CreateCharInv/CreateCharInv";
import { User } from "../../../types/user";
import { listChar } from "../CharacterInventoryReducer";

const VALID_DATA: string[] = ["a", "b"];
const REJECT_DATA: string[] = ["y", "z"];
const CHARACTER_SET_DATA: listChar[] = [
  {
    character: "a",
    status: "accepted",
    occurrences: 0
  },
  {
    character: "b",
    status: "accepted",
    occurrences: 0
  },
  {
    character: "y",
    status: "rejected",
    occurrences: 0
  },
  {
    character: "z",
    status: "rejected",
    occurrences: 0
  },
  {
    character: "m",
    status: "undecided",
    occurrences: 0
  }
];
const goal: CreateCharInv = new CreateCharInv();
const MOCK_STATE = {
  goalsState: {
    historyState: {
      history: [goal]
    }
  },
  currentProject: {
    characterSet: null
  },
  characterInventoryState: {
    validCharacters: VALID_DATA,
    rejectedCharacters: REJECT_DATA,
    characterSet: CHARACTER_SET_DATA
  }
};

let oldUser: string | null;
let oldProjectId: string | null;
const mockProjectId: string = "12345";
const mockUserEditId: string = "23456";
let mockUser: User = new User("", "", "");
mockUser.workedProjects[mockProjectId] = mockUserEditId;

const createMockStore = configureMockStore([thunk]);
const mockStore: MockStoreEnhanced<unknown, {}> = createMockStore(MOCK_STATE);

beforeAll(() => {
  oldUser = localStorage.getItem("user");
  oldProjectId = localStorage.getItem("projectId");
});

beforeEach(() => {
  localStorage.removeItem("user");
  localStorage.removeItem("projectId");
});

afterEach(() => {
  mockStore.clearActions();
});

afterAll(() => {
  if (oldUser) localStorage.setItem("user", oldUser);
  if (oldProjectId) localStorage.setItem("projectId", oldProjectId);
});

describe("Testing CharacterInventoryActions", () => {
  test("setInventory yields correct action", () => {
    expect(setValidCharacters(VALID_DATA)).toEqual({
      type: SET_VALID_CHARACTERS,
      payload: VALID_DATA
    });
  });

  test("uploadInventory dispatches correct actions", async () => {
    localStorage.setItem("user", JSON.stringify(mockUser));
    localStorage.setItem("projectId", mockProjectId);
    let mockStore = createMockStore(MOCK_STATE);
    const mockUpload = uploadInventory();
    await mockUpload(
      mockStore.dispatch,
      mockStore.getState as () => StoreState
    );

    const updatedGoal: CreateCharInv = goal;
    updatedGoal.data = {
      inventory: [[...MOCK_STATE.characterInventoryState.validCharacters]]
    };
    expect(axios.put).toHaveBeenCalledTimes(2);
    expect(mockStore.getActions()).toEqual([
      {
        type: GoalsActions.UPDATE_GOAL,
        payload: [updatedGoal]
      },
      {
        type: SET_CURRENT_PROJECT,
        payload: {
          characterSet: null,
          validCharacters: VALID_DATA,
          rejectedCharacters: REJECT_DATA
        }
      }
    ]);
  });
});
