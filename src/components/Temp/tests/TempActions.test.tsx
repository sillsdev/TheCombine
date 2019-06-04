import * as action from "../TempActions";
import * as reducer from "../TempReducer";
import configureMockStore from "redux-mock-store";
import thunk from "redux-thunk";

const createMockStore = configureMockStore([thunk]);

describe("TempAction Tests", () => {
  let mockState: reducer.TempState = reducer.defaultState;
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
    const mockDispatch = mockStore.dispatch(action.asyncPressButton());

    mockDispatch.then(() => {
      expect(mockStore.getActions()).toEqual([{ bP }]);
    });
  });
});
