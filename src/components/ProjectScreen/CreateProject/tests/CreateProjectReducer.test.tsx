import {
  failure,
  inProgress,
  reset,
  success,
} from "components/ProjectScreen/CreateProject/Redux/CreateProjectActions";
import * as reducer from "components/ProjectScreen/CreateProject/Redux/CreateProjectReducer";
import {
  CreateProjectState,
  defaultState,
} from "components/ProjectScreen/CreateProject/Redux/CreateProjectReduxTypes";
import { StoreAction, StoreActionTypes } from "rootActions";

describe("CreateProjectReducer", () => {
  test("undefined state and reset action, expecting default state", () => {
    expect(reducer.createProjectReducer(undefined, reset())).toEqual(
      defaultState,
    );
  });

  test("undefined state and failure action, expecting error message", () => {
    const errorMsg = "";
    expect(reducer.createProjectReducer(undefined, failure(errorMsg))).toEqual({
      ...defaultState,
      errorMsg,
    });
  });

  test("empty state and in-progress action, expecting inProgress", () => {
    expect(
      reducer.createProjectReducer({} as CreateProjectState, inProgress()),
    ).toEqual({ ...defaultState, inProgress: true });
  });

  test("empty state and success action, expecting success", () => {
    expect(
      reducer.createProjectReducer({} as CreateProjectState, success()),
    ).toEqual({ ...defaultState, success: true });
  });

  test("empty state and store reset action, expecting default state", () => {
    const storeResetAction: StoreAction = { type: StoreActionTypes.RESET };
    expect(
      reducer.createProjectReducer({} as CreateProjectState, storeResetAction),
    ).toEqual(defaultState);
  });
});
