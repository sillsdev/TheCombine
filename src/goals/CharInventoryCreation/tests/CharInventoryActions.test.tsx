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

const createMockStore = configureMockStore([thunk]);
const DATA: string[] = ["foo", "bar"];
const MOCK_STATE = {
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
    expect(axios.put).toHaveBeenCalledTimes(1);
    expect(mockStore.getActions()).toEqual([
      {
        type: SET_CURRENT_PROJECT,
        payload: {
          characterSet: DATA
        }
      }
    ]);
  });
});
