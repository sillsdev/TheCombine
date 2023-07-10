import configureMockStore from "redux-mock-store";
import thunk from "redux-thunk";

import * as action from "components/ProjectScreen/CreateProject/Redux/CreateProjectActions";
import { defaultState } from "components/ProjectScreen/CreateProject/Redux/CreateProjectReduxTypes";
import { newWritingSystem } from "types/writingSystem";

jest.mock("backend", () => ({
  createProject: () => Promise.reject({ response: "intentional failure" }),
}));

const mockStore = configureMockStore([thunk])(defaultState);

const project = {
  name: "testProjectName",
  vernacularLanguage: newWritingSystem("testVernCode", "testVernName"),
  analysisLanguages: [newWritingSystem("testAnalysisCode", "testAnalysisName")],
};

beforeEach(() => {
  mockStore.clearActions();
});

describe("CreateProjectActions", () => {
  test("asyncCreateProject correctly affects state", async () => {
    await mockStore.dispatch<any>(
      action.asyncCreateProject(
        project.name,
        project.vernacularLanguage,
        project.analysisLanguages,
      ),
    );
    expect(mockStore.getActions()).toEqual([
      action.inProgress(),
      action.failure(), // backend.createProject mocked to fail
    ]);
  });

  test("asyncFinishProject correctly affects state", async () => {
    await mockStore.dispatch<any>(
      action.asyncFinishProject(project.name, project.vernacularLanguage),
    );
    expect(mockStore.getActions()).toEqual([
      action.inProgress(),
      action.failure(), // backend.createProject mocked to fail
    ]);
  });
});
