import configureMockStore from "redux-mock-store";
import thunk from "redux-thunk";

import * as action from "components/ProjectScreen/CreateProject/CreateProjectActions";
import * as reducer from "components/ProjectScreen/CreateProject/CreateProjectReducer";

const createMockStore = configureMockStore([thunk]);

const project = {
  name: "testProjectName",

  vernacularLanguage: {
    name: "testVernName",
    bcp47: "testVernCode",
    font: "testVernFont",
  },
  analysisLanguages: [
    {
      name: "testAnalysisName",
      bcp47: "testAnalysisCode",
      font: "testAnalysisFont",
    },
  ],
  languageData: new File([], "testFile.lift"),
};

describe("CreateProjectAction Tests", () => {
  let mockState: reducer.CreateProjectState = reducer.defaultState;
  let CreateProject: action.CreateProjectAction = {
    type: action.CREATE_PROJECT_IN_PROGRESS,
    payload: {
      name: project.name,
      vernacularLanguage: project.vernacularLanguage,
      analysisLanguages: project.analysisLanguages,
    },
  };

  test("inProgress returns correct value", () => {
    expect(
      action.inProgress(
        project.name,
        project.vernacularLanguage,
        project.analysisLanguages
      )
    ).toEqual({
      type: action.CREATE_PROJECT_IN_PROGRESS,
      payload: {
        name: project.name,
        vernacularLanguage: project.vernacularLanguage,
        analysisLanguages: project.analysisLanguages,
      },
    });
  });

  test("asyncCreateProject correctly affects state", () => {
    const mockStore = createMockStore(mockState);
    const mockDispatch = mockStore.dispatch<any>(
      action.asyncCreateProject(
        project.name,
        project.vernacularLanguage,
        project.analysisLanguages,
        project.languageData
      )
    );

    mockDispatch
      .then(() => {
        expect(mockStore.getActions()).toEqual([CreateProject]);
      })
      .catch(() => fail());
  });
});
