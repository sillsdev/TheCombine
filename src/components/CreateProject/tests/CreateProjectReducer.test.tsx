import * as reducer from "../CreateProjectReducer";
import {
  CreateProjectAction,
  IN_PROGRESS,
  RESET
} from "../CreateProjectActions";
import { StoreActions, StoreAction } from "../../../rootActions";

const project = {
  name: "testProjectName",
  languageData: new File([], "testFile.lift")
};

describe("createActionReducer Tests", () => {
  let resultState: reducer.CreateProjectState = {
    name: project.name,
    success: false,
    inProgress: true,
    errorMsg: ""
  };

  let inProgress: CreateProjectAction = {
    type: IN_PROGRESS,
    payload: project
  };

  // Test with no state
  test("no state, expecting default state", () => {
    expect(
      reducer.createProjectReducer(undefined, {
        type: RESET,
        payload: project
      })
    ).toEqual(reducer.defaultState);
  });

  test("default state, expecting create project", () => {
    expect(
      reducer.createProjectReducer({} as reducer.CreateProjectState, inProgress)
    ).toEqual(resultState);
  });

  test("non-default state, expecting default state", () => {
    const resetAction: StoreAction = {
      type: StoreActions.RESET
    };

    expect(
      reducer.createProjectReducer(
        {} as reducer.CreateProjectState,
        resetAction
      )
    ).toEqual(reducer.defaultState);
  });
});
