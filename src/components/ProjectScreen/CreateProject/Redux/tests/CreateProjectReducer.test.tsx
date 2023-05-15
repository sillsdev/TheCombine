import * as reducer from "components/ProjectScreen/CreateProject/Redux/CreateProjectReducer";
import {
  CreateProjectAction,
  CreateProjectActionTypes,
  CreateProjectState,
  defaultState,
} from "components/ProjectScreen/CreateProject/Redux/CreateProjectReduxTypes";
import { StoreAction, StoreActionTypes } from "rootActions";

describe("CreateProjectReducer", () => {
  const resultState: CreateProjectState = {
    inProgress: true,
    success: false,
    errorMsg: "",
  };

  const inProgress: CreateProjectAction = {
    type: CreateProjectActionTypes.CREATE_PROJECT_IN_PROGRESS,
    payload: {},
  };

  // Test with no state
  test("no state, expecting default state", () => {
    expect(
      reducer.createProjectReducer(undefined, {
        type: CreateProjectActionTypes.CREATE_PROJECT_RESET,
        payload: {},
      })
    ).toEqual(defaultState);
  });

  test("default state, expecting create project", () => {
    expect(
      reducer.createProjectReducer({} as CreateProjectState, inProgress)
    ).toEqual(resultState);
  });

  test("non-default state, expecting default state", () => {
    const resetAction: StoreAction = {
      type: StoreActionTypes.RESET,
    };

    expect(
      reducer.createProjectReducer({} as CreateProjectState, resetAction)
    ).toEqual(defaultState);
  });
});
