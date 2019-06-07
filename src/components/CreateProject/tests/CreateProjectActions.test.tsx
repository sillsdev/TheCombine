import * as action from "../CreateProjectActions";
import * as reducer from "../CreateProjectReducer";
import configureMockStore from "redux-mock-store";
import thunk from "redux-thunk";

const createMockStore = configureMockStore([thunk]);

const project = {
  name: "testProjectName",
  languageData: new File([], "testFile.lift")
};

describe("CreateProjectAction Tests", () => {
  let mockState: reducer.CreateProjectState = reducer.defaultState;
  let CreateProject: action.CreateProjectAction = {
    type: action.CREATE_PROJECT,
    payload: project
  };

  test("createProject returns correct value", () => {
    expect(action.createProject(project.name, project.languageData)).toEqual(
      CreateProject
    );
  });

  test("asyncCreateProject correctly affects state", () => {
    const mockStore = createMockStore(mockState);
    const mockDispatch = mockStore.dispatch<any>(
      action.asyncCreateProject(project.name, project.languageData)
    );

    mockDispatch
      .then(() => {
        expect(mockStore.getActions()).toEqual([CreateProject]);
      })
      .catch(() => fail());
  });
});
