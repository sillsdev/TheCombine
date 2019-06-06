import * as reducer from "../TempReducer";
import { TempAction, PRESS_BUTTON } from "../TempActions";

describe("tempReducer Tests", () => {
  let dummySt: reducer.TempState = reducer.defaultState;
  let resultState: reducer.TempState = {
    tempText: "BUTTON PRESSED! REDUX WORKING!"
  };

  let dummyAc: TempAction = {
    type: PRESS_BUTTON
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
});
