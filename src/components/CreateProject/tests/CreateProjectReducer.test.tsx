import * as reducer from "../CreateProjectReducer";
import {
  CreateProjectAction,
  IN_PROGRESS,
  RESET
} from "../CreateProjectActions";

const project = {
  name: "testProjectName",
  languageData: new File([], "testFile.lift")
};

describe("createActionReducer Tests", () => {
  let dummySt: reducer.CreateProjectState = reducer.defaultState;
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
    expect(reducer.createProjectReducer(dummySt, inProgress)).toEqual(
      resultState
    );
  });
});
