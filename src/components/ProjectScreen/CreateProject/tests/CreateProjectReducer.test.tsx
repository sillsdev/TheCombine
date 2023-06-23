import { reset } from "components/ProjectScreen/CreateProject/Redux/CreateProjectActions";
import * as reducer from "components/ProjectScreen/CreateProject/Redux/CreateProjectReducer";
import {
  CreateProjectAction,
  CreateProjectActionTypes,
  CreateProjectState,
  defaultState,
} from "components/ProjectScreen/CreateProject/Redux/CreateProjectReduxTypes";
import { StoreAction, StoreActionTypes } from "rootActions";

describe("CreateProjectReducer", () => {
  const inProgress: CreateProjectAction = {
    type: CreateProjectActionTypes.CREATE_PROJECT_IN_PROGRESS,
    payload: {},
  };

  // Test with no state
  test("no state, expecting default state", () => {
    expect(reducer.createProjectReducer(undefined, reset())).toEqual(
      defaultState
    );
  });

  test("default state, expecting create project", () => {
    expect(
      reducer.createProjectReducer({} as CreateProjectState, inProgress)
    ).toEqual({ ...defaultState, inProgress: true });
  });

  test("non-default state, expecting default state", () => {
    const storeResetAction: StoreAction = { type: StoreActionTypes.RESET };
    expect(
      reducer.createProjectReducer({} as CreateProjectState, storeResetAction)
    ).toEqual(defaultState);
  });
});
