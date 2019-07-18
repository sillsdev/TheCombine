import {
  setInventory,
  SET_CHARACTER_INVENTORY,
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

const DATA: string[] = ["foo", "bar"];
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
    inventory: DATA
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
  if (oldUser) localStorage.setItem("user", oldUser);
  if (oldProjectId) localStorage.setItem("projectId", oldProjectId);
  mockStore.clearActions();
});

describe("Testing CharacterInventoryActions", () => {
  test("setInventory yields correct action", () => {
    expect(setInventory(DATA)).toEqual({
      type: SET_CHARACTER_INVENTORY,
      payload: DATA
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
      inventory: [[...MOCK_STATE.characterInventoryState.inventory]]
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
          characterSet: DATA
        }
      }
    ]);
  });
});
