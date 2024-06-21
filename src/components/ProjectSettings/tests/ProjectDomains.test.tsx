import { Accordion } from "@mui/material";
import renderer from "react-test-renderer";

import {
  type Project,
  type SemanticDomainFull,
  type WritingSystem,
} from "api/models";
import ProjectDomains, {
  AddDomainDialog,
  ProjectDomainsId,
} from "components/ProjectSettings/ProjectDomains";
import { newProject } from "types/project";
import { newSemanticDomain } from "types/semanticDomain";
import { newWritingSystem } from "types/writingSystem";

// Dialog uses portals, which are not supported in react-test-renderer.
jest.mock("@mui/material/Dialog", () => "div");
// Textfield with multiline not supported in react-test-renderer.
jest.mock("@mui/material/TextField", () => "div");

jest.mock("components/TreeView", () => "div");
jest.mock("i18n", () => ({ language: "en-US" }));

const mockSetProject = jest.fn();

let projectMaster: renderer.ReactTestRenderer;

function mockProject(
  semDomWritingSystem?: WritingSystem,
  customDomains?: SemanticDomainFull[]
): Project {
  return {
    ...newProject(),
    semDomWritingSystem: semDomWritingSystem ?? newWritingSystem(),
    semanticDomains: customDomains ?? [],
  };
}

const renderProjLangs = async (project: Project): Promise<void> => {
  mockSetProject.mockResolvedValue(undefined);
  await renderer.act(async () => {
    projectMaster = renderer.create(
      <ProjectDomains project={project} setProject={mockSetProject} />
    );
  });
};

describe("ProjectDomains", () => {
  it("has a button for adding a custom semantic domain", async () => {
    await renderProjLangs(mockProject());
    const addDialog = projectMaster.root.findByType(AddDomainDialog);
    expect(addDialog.props.open).toBeFalsy();

    // Open the dialog to add a new domain
    const addButton = projectMaster.root.findByProps({
      id: ProjectDomainsId.ButtonDomainAdd,
    });
    await renderer.act(async () => {
      addButton.props.onClick();
    });
    expect(addDialog.props.open).toBeTruthy();

    // Close the dialog
    const cancelButton = projectMaster.root.findByProps({
      id: ProjectDomainsId.ButtonDomainAddDialogCancel,
    });
    await renderer.act(async () => {
      cancelButton.props.onClick();
    });
    expect(addDialog.props.open).toBeFalsy();
  });

  it("only renders custom domains for the current semantic domain language", async () => {
    const semDomLang = "fr";
    const customDoms = [
      newSemanticDomain("1", "one", semDomLang),
      newSemanticDomain("2", "two", semDomLang),
      newSemanticDomain("3", "three", semDomLang),
      newSemanticDomain("-4", "not four", "other"),
      newSemanticDomain("-5", "not five", "different"),
    ];
    await renderProjLangs(
      mockProject(newWritingSystem(semDomLang), customDoms)
    );
    expect(projectMaster.root.findAllByType(Accordion)).toHaveLength(3);
  });
});
