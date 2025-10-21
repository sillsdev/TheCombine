import "@testing-library/jest-dom";
import { act, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

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
  await act(async () => {
    render(
      <ProjectLanguages
        project={project}
        readOnly={readOnly}
        setProject={mockSetProject}
      />
    );
  });
};

describe("ProjectLanguages", () => {
  it("renders readOnly", async () => {
    await renderProjLangs(mockProject([...mockAnalysisWritingSystems]), true);
    expect(screen.queryAllByRole("button")).toHaveLength(0);
    expect(screen.queryAllByRole("combobox")).toHaveLength(0);
  });

  it("can change vernacular language name", async () => {
    await renderProjLangs(mockProject([...mockAnalysisWritingSystems]));
    const newName = "Vern Lang";
    await userEvent.click(
      screen.getByTestId(ProjectLanguagesId.ButtonEditVernacularName)
    );
    const vernField = screen.getByRole("textbox");
    await userEvent.clear(vernField);
    await userEvent.type(vernField, newName);
    await userEvent.click(
      screen.getByTestId(ProjectLanguagesId.ButtonEditVernacularNameSave)
    );
    expect(
      mockSetProject.mock.calls[0][0].vernacularWritingSystem.name
    ).toEqual(newName);
  });

  it("loads language picker to add an analysis language", async () => {
    await renderProjLangs(mockProject([...mockAnalysisWritingSystems]));
    const langPickerText = "Language";
    expect(screen.queryByText(langPickerText)).toBeNull();
    await userEvent.click(
      screen.getByTestId(ProjectLanguagesId.ButtonAddAnalysisLang)
    );
    expect(screen.queryByText(langPickerText)).toBeTruthy();
  });

  it("has a semantic domain language selector", async () => {
    await renderProjLangs(mockProject([], newWritingSystem("fr")));
    expect(
      within(screen.getByRole("combobox")).queryByText("fr (Français)")
    ).toBeTruthy();
  });
});
