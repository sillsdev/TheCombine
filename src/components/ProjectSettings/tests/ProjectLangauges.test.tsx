import { Button, Select } from "@mui/material";
import { LanguagePicker } from "mui-language-picker";
import renderer from "react-test-renderer";

import "tests/reactI18nextMock";

import { Project, WritingSystem } from "api/models";
import ProjectLanguages from "components/ProjectSettings/ProjectLanguages";
import { newProject } from "types/project";
import { newWritingSystem } from "types/writingSystem";

const mockAnalysisWritingSystems = [
  newWritingSystem("a", "a"),
  newWritingSystem("b", "b"),
];
const mockUpdateProject = jest.fn();

let projectMaster: renderer.ReactTestRenderer;
let pickerHandle: renderer.ReactTestInstance;
let buttonHandle: renderer.ReactTestInstance;

function mockProject(systems?: WritingSystem[]): Project {
  return { ...newProject(), analysisWritingSystems: systems ?? [] };
}

const renderProjLangs = async (
  project: Project,
  readOnly = false
): Promise<void> => {
  mockUpdateProject.mockResolvedValue(undefined);
  await renderer.act(async () => {
    projectMaster = renderer.create(
      <ProjectLanguages
        project={project}
        readOnly={readOnly}
        updateProject={mockUpdateProject}
      />
    );
  });
};

const renderAndClickAdd = async (): Promise<void> => {
  await renderProjLangs(mockProject([...mockAnalysisWritingSystems]));
  expect(projectMaster.root.findAllByType(LanguagePicker)).toHaveLength(0);
  renderer.act(() => {
    projectMaster.root
      .findByProps({ textId: "projectSettings.language.addAnalysisLanguage" })
      .props.onClick();
  });
  expect(projectMaster.root.findAllByType(LanguagePicker)).toHaveLength(1);
};

describe("ProjectLanguages", () => {
  it("renders readOnly", async () => {
    await renderProjLangs(mockProject([...mockAnalysisWritingSystems]), true);
    expect(projectMaster.root.findAllByType(Button)).toHaveLength(0);
    expect(projectMaster.root.findAllByType(Select)).toHaveLength(0);
  });

  it("can add language to project", async () => {
    await renderAndClickAdd();
    pickerHandle = projectMaster.root.findByType(LanguagePicker);
    const newLang = newWritingSystem("new-code", "new-name", "new-font");
    await renderer.act(async () => {
      pickerHandle.props.setCode(newLang.bcp47);
    });
    await renderer.act(async () => {
      pickerHandle.props.setName(newLang.name);
    });
    await renderer.act(async () => {
      pickerHandle.props.setFont(newLang.font);
    });
    await renderer.act(async () => {
      projectMaster.root
        .findByProps({ id: "analysis-language-new-confirm" })
        .props.onClick();
    });
    expect(mockUpdateProject).toBeCalledWith(
      mockProject([...mockAnalysisWritingSystems, newLang])
    );
  });

  it("can only submit when new language selected", async () => {
    await renderAndClickAdd();
    pickerHandle = projectMaster.root.findByType(LanguagePicker);
    buttonHandle = projectMaster.root.findByProps({
      id: "analysis-language-new-confirm",
    });
    expect(buttonHandle.props.disabled).toBe(true);
    await renderer.act(async () => {
      pickerHandle.props.setCode(mockAnalysisWritingSystems[0].bcp47);
    });
    expect(buttonHandle.props.disabled).toBe(true);
    await renderer.act(async () => {
      pickerHandle.props.setCode("completely-novel-code");
    });
    expect(buttonHandle.props.disabled).toBe(false);
  });
});
