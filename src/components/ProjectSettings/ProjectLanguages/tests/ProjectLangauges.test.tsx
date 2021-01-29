import { LanguagePicker } from "mui-language-picker";
import React from "react";
import { Provider } from "react-redux";
import renderer, {
  ReactTestInstance,
  ReactTestRenderer,
} from "react-test-renderer";
import configureMockStore from "redux-mock-store";

import { defaultState } from "components/App/DefaultState";
import ProjectLanguages from "components/ProjectSettings/ProjectLanguages/ProjectLanguages";
import { defaultProject, Project, WritingSystem } from "types/project";

const createMockStore = configureMockStore([]);
const mockStore = createMockStore(defaultState);
const mockAnalysisWritingSystems: WritingSystem[] = [
  { name: "a", bcp47: "a", font: "" },
  { name: "b", bcp47: "b", font: "" },
];
const mockUpdateProject = jest.fn();

let projectMaster: ReactTestRenderer;
let pickerHandle: ReactTestInstance;
let buttonHandle: ReactTestInstance;

function mockProject(systems?: WritingSystem[]) {
  return { ...defaultProject, analysisWritingSystems: systems ?? [] };
}

function renderProjLangs(proj: Project) {
  mockUpdateProject.mockResolvedValue(undefined);
  renderer.act(() => {
    projectMaster = renderer.create(
      <Provider store={mockStore}>
        <ProjectLanguages
          project={proj}
          saveChangesToProject={mockUpdateProject}
        />
      </Provider>
    );
  });
}

function renderAndClickAdd() {
  renderProjLangs(mockProject([...mockAnalysisWritingSystems]));
  expect(projectMaster.root.findAllByType(LanguagePicker).length).toEqual(0);
  projectMaster.root.findByProps({ id: "addNewLang" }).props.onClick();
  expect(projectMaster.root.findAllByType(LanguagePicker).length).toEqual(1);
}

describe("ProjectLanguages", () => {
  it("renders without crashing", () => {
    renderProjLangs(mockProject([...mockAnalysisWritingSystems]));
  });

  it("can add language to project", () => {
    renderAndClickAdd();
    pickerHandle = projectMaster.root.findByType(LanguagePicker);
    pickerHandle.props.setCode("z");
    pickerHandle.props.setName("z");
    projectMaster.root.findByProps({ id: "submitNewLang" }).props.onClick();
    expect(mockUpdateProject).toBeCalledWith(
      mockProject([
        ...mockAnalysisWritingSystems,
        { name: "z", bcp47: "z", font: "" },
      ])
    );
  });

  it("can only submit when new language selected", () => {
    renderAndClickAdd();
    pickerHandle = projectMaster.root.findByType(LanguagePicker);
    buttonHandle = projectMaster.root.findByProps({ id: "submitNewLang" });
    expect(buttonHandle.props.disabled).toBe(true);
    pickerHandle.props.setCode(mockAnalysisWritingSystems[0].bcp47);
    expect(buttonHandle.props.disabled).toBe(true);
    pickerHandle.props.setCode("z");
    expect(buttonHandle.props.disabled).toBe(false);
  });
});
