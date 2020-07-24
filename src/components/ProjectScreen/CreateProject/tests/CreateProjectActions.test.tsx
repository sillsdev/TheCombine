import * as action from "../CreateProjectActions";
import * as reducer from "../CreateProjectReducer";
import configureMockStore from "redux-mock-store";
import thunk from "redux-thunk";
import { IN_PROGRESS } from "../CreateProjectActions";

const createMockStore = configureMockStore([thunk]);

const project = {
  name: "testProjectName",

  vernacularLanguage: {
    name: "testvernname",
    bcp47: "testverncode",
    font: "testvernfont",
  },
  analysisLanguages: [
    {
      name: "testanalysisname",
      bcp47: "testanalysiscode",
      font: "testanalysisfont",
    },
  ],
  languageData: new File([], "testFile.lift"),
};

describe("CreateProjectAction Tests", () => {
  let mockState: reducer.CreateProjectState = reducer.defaultState;
  let CreateProject: action.CreateProjectAction = {
    type: action.IN_PROGRESS,
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
      type: IN_PROGRESS,
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
