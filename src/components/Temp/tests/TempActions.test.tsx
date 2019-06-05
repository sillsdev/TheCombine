import * as action from "../TempActions";
import { defaultState } from "../TempReducer";
import configureMockStore from "redux-mock-store";
import thunk from "redux-thunk";
import axios from "axios";

const createMockStore = configureMockStore([thunk]);

describe("TempAction Tests", () => {
  let mockState = {
    // Missing localize
    tempState: {
      ...defaultState
    }
  };
  let bP: action.ButtonPressed = {
    type: action.PRESS_BUTTON
  };

  // Test whether pressButton returns a proper value
  test("pressButton returns correct value", () => {
    expect(action.pressButton()).toEqual(bP);
  });

  // Test whether asyncPressButton results in certain changes to state
  test("asyncButtonPress correctly affects state", () => {
    const mockStore = createMockStore(mockState);
    const mockDispatch = mockStore.dispatch<any>(action.asyncPressButton());

    mockDispatch
      .then(() => {
        expect(mockStore.getActions()).toEqual([bP]);
        expect(axios.post).toHaveBeenCalled();
      })
      .catch(() => {
        console.error("Error: dispatch failed");
        fail();
      });
  });
});
