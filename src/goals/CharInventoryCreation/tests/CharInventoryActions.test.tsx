import {
  setInventory,
  SET_CHARACTER_INVENTORY,
  uploadInventory
} from "../CharacterInventoryActions";
import configureMockStore from "redux-mock-store";
import thunk from "redux-thunk";
import { StoreState } from "../../../types";
import axios from "axios";
import { SET_CURRENT_PROJECT } from "../../../components/Project/ProjectActions";
import { GoalsActions } from "../../../components/GoalTimeline/GoalsActions";
import { CreateCharInv } from "../../CreateCharInv/CreateCharInv";

const createMockStore = configureMockStore([thunk]);
jest.mock("../../../components/GoalTimeline/GoalsActions", () => {
  const User = jest.requireActual("../../../types/user");
  const goalsActions = jest.requireActual(
    "../../../components/GoalTimeline/GoalsActions"
  );
  return {
    ...goalsActions,
    getUser: jest.fn(() => {
      return new User.User("", "", "");
    }),
    getUserEditId: jest.fn(() => {
      return "";
    })
  };
});

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

describe("Testing CharacterInventoryActions", () => {
  test("setInventory yields correct action", () => {
    expect(setInventory(DATA)).toEqual({
      type: SET_CHARACTER_INVENTORY,
      payload: DATA
    });
  });

  test("uploadInventory dispatches correct actions", async () => {
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
