import { StoreAction, StoreActions } from "rootActions";
import * as reducer from "components/ProjectScreen/CreateProject/Redux/CreateProjectReducer";
import {
  CreateProjectAction,
  CreateProjectActions,
} from "../Redux/CreateProjectReduxTypes";

const emptyWritingSystem = {
  name: "",
  bcp47: "",
  font: "",
};

const project = {
  name: "testProjectName",
  languageData: new File([], "testFile.lift"),
  vernacularLanguage: emptyWritingSystem,
  analysisLanguages: [emptyWritingSystem],
};

describe("createActionReducer Tests", () => {
  let resultState: reducer.CreateProjectState = {
    name: project.name,
    inProgress: true,
    success: false,
    errorMsg: "",
    vernacularLanguage: project.vernacularLanguage,
    analysisLanguages: project.analysisLanguages,
  };

  let inProgress: CreateProjectAction = {
    type: CreateProjectActions.CREATE_PROJECT_IN_PROGRESS,
    payload: project,
  };

  // Test with no state
  test("no state, expecting default state", () => {
    expect(
      reducer.createProjectReducer(undefined, {
        type: CreateProjectActions.CREATE_PROJECT_RESET,
        payload: project,
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
      type: StoreActions.RESET,
    };

    expect(
      reducer.createProjectReducer(
        {} as reducer.CreateProjectState,
        resetAction
      )
    ).toEqual(reducer.defaultState);
  });
});
