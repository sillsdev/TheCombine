import configureMockStore from "redux-mock-store";
import thunk from "redux-thunk";

import * as action from "components/ProjectScreen/CreateProject/Redux/CreateProjectActions";
import { defaultState } from "components/ProjectScreen/CreateProject/Redux/CreateProjectReduxTypes";

jest.mock("backend", () => ({
  createProject: () => Promise.reject({ response: "intentional failure" }),
}));

const mockStore = configureMockStore([thunk])(defaultState);

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
};

beforeEach(() => {
  mockStore.clearActions();
});

describe("CreateProjectAction Tests", () => {
  test("asyncCreateProject correctly affects state", async () => {
    await mockStore.dispatch<any>(
      action.asyncCreateProject(
        project.name,
        project.vernacularLanguage,
        project.analysisLanguages
      )
    );
    expect(mockStore.getActions()).toEqual([
      action.inProgress(),
      action.failure(), // backend.createProject mocked to fail
    ]);
  });

  test("asyncFinishProject correctly affects state", async () => {
    await mockStore.dispatch<any>(
      action.asyncFinishProject(project.name, project.vernacularLanguage)
    );
    expect(mockStore.getActions()).toEqual([
      action.inProgress(),
      action.failure(), // backend.createProject mocked to fail
    ]);
  });
});
