import configureMockStore from "redux-mock-store";
import thunk from "redux-thunk";

import * as action from "components/ProjectScreen/CreateProject/Redux/CreateProjectActions";
import {
  defaultState,
  CreateProjectAction,
  CreateProjectActionTypes,
} from "components/ProjectScreen/CreateProject/Redux/CreateProjectReduxTypes";

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
  recordingConsented: false,
  languageData: new File([], "testFile.lift"),
};

describe("CreateProjectAction Tests", () => {
  const mockState = defaultState;
  const CreateProject: CreateProjectAction = {
    type: CreateProjectActionTypes.CREATE_PROJECT_IN_PROGRESS,
    payload: {},
  };

  test("inProgress returns correct value", () => {
    expect(action.inProgress()).toEqual({
      type: CreateProjectActionTypes.CREATE_PROJECT_IN_PROGRESS,
      payload: {},
    });
  });

  test("asyncCreateProject correctly affects state", () => {
    const mockStore = createMockStore(mockState);
    const mockDispatch = mockStore.dispatch<any>(
      action.asyncCreateProject(
        project.name,
        project.vernacularLanguage,
        project.analysisLanguages,
        project.recordingConsented,
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
