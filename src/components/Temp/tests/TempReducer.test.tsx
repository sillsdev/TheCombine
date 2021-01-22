import * as reducer from "components/Temp/TempReducer";
import { TempAction, PRESS_BUTTON } from "components/Temp/TempActions";
import { StoreAction, StoreActions } from "rootActions";

describe("tempReducer Tests", () => {
  let dummySt: reducer.TempState = reducer.defaultState;
  let resultState: reducer.TempState = {
    tempText: "BUTTON PRESSED! REDUX WORKING!",
  };

  let dummyAc: TempAction = {
    type: PRESS_BUTTON,
  };

  // Test with no state
  test("no state, expecting default state", () => {
    expect(reducer.tempReducer(undefined, dummyAc)).toEqual(
      reducer.defaultState
    );
  });

  // Test PRESS_BUTTON
  test("default state, expecting pressed state", () => {
    expect(reducer.tempReducer(dummySt, dummyAc)).toEqual(resultState);
  });

  test("passing reset action returns default state", () => {
    const action: StoreAction = {
      type: StoreActions.RESET,
    };

    expect(reducer.tempReducer({} as reducer.TempState, action)).toEqual(
      reducer.defaultState
    );
  });
});
