import {
  setValidCharacters,
  SET_VALID_CHARACTERS,
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
const DATA: string[] = ["foo", "bar"];
const DATA2: string[] = ["a", "b"];
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
    validCharacters: DATA,
    rejectedCharacters: DATA2
  }
};

describe("Testing CharacterInventoryActions", () => {
  test("setInventory yields correct action", () => {
    expect(setValidCharacters(DATA)).toEqual({
      type: SET_VALID_CHARACTERS,
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
          validCharacters: ["foo", "bar"],
          rejectedCharacters: ["a", "b"]
        }
      }
    ]);
  });
});
