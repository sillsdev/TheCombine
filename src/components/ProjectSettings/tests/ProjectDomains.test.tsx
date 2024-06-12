import { Accordion } from "@mui/material";
import renderer from "react-test-renderer";

import {
  SemanticDomainFull,
  type Project,
  type WritingSystem,
} from "api/models";
import ProjectDomains, {
  ProjectDomainsId,
} from "components/ProjectSettings/ProjectDomains";
import { newProject } from "types/project";
import { newSemanticDomain } from "types/semanticDomain";
import { newWritingSystem } from "types/writingSystem";

// Textfield with multiline not supported in react-test-renderer
jest.mock("@mui/material/TextField", () => "div");

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
    expect(() =>
      projectMaster.root.findByProps({ id: ProjectDomainsId.ButtonDomainAdd })
    ).not.toThrow();
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
