import { StoreAction, StoreActions } from "rootActions";
import * as reducer from "components/ProjectScreen/CreateProject/Redux/CreateProjectReducer";
import {
  CreateProjectAction,
  CreateProjectActions,
  CreateProjectState,
  defaultState,
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
  let resultState: CreateProjectState = {
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
    ).toEqual(defaultState);
  });

  test("default state, expecting create project", () => {
    expect(
      reducer.createProjectReducer({} as CreateProjectState, inProgress)
    ).toEqual(resultState);
  });

  test("non-default state, expecting default state", () => {
    const resetAction: StoreAction = {
      type: StoreActions.RESET,
    };

    expect(
      reducer.createProjectReducer({} as CreateProjectState, resetAction)
    ).toEqual(defaultState);
  });
});
