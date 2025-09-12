import "@testing-library/jest-dom";
import {
  act,
  render,
  screen,
  waitForElementToBeRemoved,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import {
  type Project,
  type SemanticDomainFull,
  type WritingSystem,
} from "api/models";
import ProjectDomains, {
  getDomainLabel,
  ProjectDomainsId,
  trimDomain,
} from "components/ProjectSettings/ProjectDomains";
import { newProject } from "types/project";
import { newSemanticDomain } from "types/semanticDomain";
import { newWritingSystem } from "types/writingSystem";

jest.mock("components/TreeView", () => "div");
jest.mock("i18n", () => ({ language: "en-US" }));

const mockSetProject = jest.fn();

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
  await act(async () => {
    render(<ProjectDomains project={project} setProject={mockSetProject} />);
  });
};

describe("ProjectDomains", () => {
  it("has a button for adding a custom semantic domain", async () => {
    await renderProjLangs(mockProject());
    expect(screen.queryByRole("dialog")).toBeNull();

    // Open the dialog to add a new domain
    await userEvent.click(screen.getByTestId(ProjectDomainsId.ButtonDomainAdd));
    expect(screen.queryByRole("dialog")).toBeTruthy();

    // Close the dialog
    await userEvent.click(
      screen.getByTestId(ProjectDomainsId.ButtonDomainAddDialogCancel)
    );
    // Wait for dialog removal, else it's only hidden.
    await waitForElementToBeRemoved(() => screen.queryByRole("dialog"));
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("only renders custom domains for the current semantic domain language", async () => {
    const semDomLang = "fr";
    const inDoms = [
      newSemanticDomain("1", "one", semDomLang),
      newSemanticDomain("2", "two", semDomLang),
      newSemanticDomain("3", "three", semDomLang),
    ];
    const outDoms = [
      newSemanticDomain("-4", "not four", "other"),
      newSemanticDomain("-5", "not five", "different"),
    ];
    await renderProjLangs(
      mockProject(newWritingSystem(semDomLang), [...inDoms, ...outDoms])
    );
    inDoms.forEach((dom) => {
      expect(screen.queryByText(getDomainLabel(dom))).toBeTruthy();
    });
    outDoms.forEach((dom) => {
      expect(screen.queryByText(getDomainLabel(dom))).toBeNull();
    });
  });
});

describe("trimDomains", () => {
  it("trims description, name, and questions and removes empty questions", () => {
    const description = "Description of a custom semantic domain";
    const name = "Custom Domain Name";
    const question = "What words does this domain make you think of?";
    const untrimmedDom = newSemanticDomain("3.14159", `\t${name} `);
    untrimmedDom.description = `  ${description}\n`;
    untrimmedDom.questions.push("", ` \n ${question}\t\t`, " \t ", "");
    const trimmedDom = trimDomain(untrimmedDom);
    expect(trimmedDom.description).toEqual(description);
    expect(trimmedDom.name).toEqual(name);
    expect(trimmedDom.questions).toHaveLength(1);
    expect(trimmedDom.questions[0]).toEqual(question);
  });
});
