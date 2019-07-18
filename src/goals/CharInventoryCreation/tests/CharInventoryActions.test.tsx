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
const VALID_DATA: string[] = ["foo", "bar"];
const REJECT_DATA: string[] = ["a", "b"];
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
    rejectedCharacters: REJECT_DATA
  }
};

describe("Testing CharacterInventoryActions", () => {
  test("setInventory yields correct action", () => {
    expect(setValidCharacters(VALID_DATA)).toEqual({
      type: SET_VALID_CHARACTERS,
      payload: VALID_DATA
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
          validCharacters: VALID_DATA,
          rejectedCharacters: REJECT_DATA
        }
      }
    ]);
  });
});
