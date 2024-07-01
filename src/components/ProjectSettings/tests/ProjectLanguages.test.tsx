import { Button, IconButton, Select } from "@mui/material";
import { LanguagePicker } from "mui-language-picker";
import renderer from "react-test-renderer";

import { type Project, type WritingSystem } from "api/models";
import ProjectLanguages, {
  ProjectLanguagesId,
} from "components/ProjectSettings/ProjectLanguages";
import { newProject } from "types/project";
import { newWritingSystem } from "types/writingSystem";

const mockAnalysisWritingSystems = [
  newWritingSystem("a", "a"),
  newWritingSystem("b", "b"),
];
const mockSetProject = jest.fn();

let projectMaster: renderer.ReactTestRenderer;
let pickerHandle: renderer.ReactTestInstance;
let buttonHandle: renderer.ReactTestInstance;

function mockProject(
  analysisSystems?: WritingSystem[],
  semDomSystem?: WritingSystem
): Project {
  return {
    ...newProject(),
    analysisWritingSystems: analysisSystems ?? [],
    semDomWritingSystem: semDomSystem ?? newWritingSystem(),
  };
}

const renderProjLangs = async (
  project: Project,
  readOnly = false
): Promise<void> => {
  mockSetProject.mockResolvedValue(undefined);
  await renderer.act(async () => {
    projectMaster = renderer.create(
      <ProjectLanguages
        project={project}
        readOnly={readOnly}
        setProject={mockSetProject}
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
    expect(projectMaster.root.findAllByType(IconButton)).toHaveLength(0);
    expect(projectMaster.root.findAllByType(Select)).toHaveLength(0);
  });

  it("can change vernacular language name", async () => {
    await renderProjLangs(mockProject([...mockAnalysisWritingSystems]));
    const newName = "Vern Lang";
    await renderer.act(async () => {
      projectMaster.root
        .findByProps({ id: ProjectLanguagesId.ButtonEditVernacularName })
        .props.onClick();
    });
    await renderer.act(async () => {
      projectMaster.root
        .findByProps({ id: ProjectLanguagesId.FieldEditVernacularName })
        .props.onChange({ target: { value: newName } });
    });
    await renderer.act(async () => {
      projectMaster.root
        .findByProps({ id: ProjectLanguagesId.ButtonEditVernacularNameSave })
        .props.onClick();
    });
    expect(
      mockSetProject.mock.calls[0][0].vernacularWritingSystem.name
    ).toEqual(newName);
  });

  it("can add analysis language to project", async () => {
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
        .findByProps({ id: ProjectLanguagesId.ButtonAddAnalysisLangConfirm })
        .props.onClick();
    });
    expect(mockSetProject).toHaveBeenCalledWith(
      mockProject([...mockAnalysisWritingSystems, newLang])
    );
  });

  it("can only submit when new analysis language selected", async () => {
    await renderAndClickAdd();
    pickerHandle = projectMaster.root.findByType(LanguagePicker);
    buttonHandle = projectMaster.root.findByProps({
      id: ProjectLanguagesId.ButtonAddAnalysisLangConfirm,
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

  it("has a semantic domain language selector", async () => {
    const semDomLang = "fr";
    await renderProjLangs(mockProject([], newWritingSystem(semDomLang)));
    expect(
      projectMaster.root.findByProps({
        id: ProjectLanguagesId.SelectSemDomLang,
      }).props.value
    ).toEqual(semDomLang);
  });
});
