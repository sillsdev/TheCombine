import { LanguagePicker } from "mui-language-picker";
import { Provider } from "react-redux";
import renderer, {
  ReactTestInstance,
  ReactTestRenderer,
} from "react-test-renderer";
import configureMockStore from "redux-mock-store";

import { Project, WritingSystem } from "api/models";
import ProjectLanguages from "components/ProjectSettings/ProjectLanguages/ProjectLanguages";
import { newProject } from "types/project";

// This test relies on nothing in the store so mock an empty store
const mockStore = configureMockStore()();
const mockAnalysisWritingSystems: WritingSystem[] = [
  { name: "a", bcp47: "a", font: "" },
  { name: "b", bcp47: "b", font: "" },
];
const mockUpdateProject = jest.fn();

let projectMaster: ReactTestRenderer;
let pickerHandle: ReactTestInstance;
let buttonHandle: ReactTestInstance;

function mockProject(systems?: WritingSystem[]) {
  return { ...newProject(), analysisWritingSystems: systems ?? [] };
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
  projectMaster.root
    .findByProps({ textId: "projectSettings.language.addAnalysisLanguage" })
    .props.onClick();
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
    projectMaster.root
      .findByProps({ id: "analysis-language-new-confirm" })
      .props.onClick();
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
    buttonHandle = projectMaster.root.findByProps({
      id: "analysis-language-new-confirm",
    });
    expect(buttonHandle.props.disabled).toBe(true);
    pickerHandle.props.setCode(mockAnalysisWritingSystems[0].bcp47);
    expect(buttonHandle.props.disabled).toBe(true);
    pickerHandle.props.setCode("z");
    expect(buttonHandle.props.disabled).toBe(false);
  });
});
