import * as reducer from "../CreateProjectReducer";
import { CreateProjectAction, CREATE_PROJECT } from "../CreateProjectActions";

const project = {
  name: "testProjectName",
  languageData: new File([], "testFile.lift")
};

describe("createActionReducer Tests", () => {
  let dummySt: reducer.CreateProjectState = reducer.defaultState;
  let resultState: reducer.CreateProjectState = {
    name: project.name,
    success: true
  };

  let createProject: CreateProjectAction = {
    type: CREATE_PROJECT,
    payload: project
  };

  // Test with no state
  test("no state, expecting default state", () => {
    expect(reducer.createProjectReducer(undefined, createProject)).toEqual(
      reducer.defaultState
    );
  });

  test("default state, expecting create project", () => {
    expect(reducer.createProjectReducer(dummySt, createProject)).toEqual(
      resultState
    );
  });
});
