import "@testing-library/jest-dom";
import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { OffOnSetting } from "api/models";
import ProjectAutocomplete, {
  ProjectAutocompleteTextId,
} from "components/ProjectSettings/ProjectAutocomplete";
import { randomProject } from "types/project";

const mockSetProject = jest.fn();

const mockProject = randomProject();
mockProject.autocompleteSetting = OffOnSetting.Off;

const renderAutocomplete = async (): Promise<void> => {
  await act(async () => {
    render(
      <ProjectAutocomplete project={mockProject} setProject={mockSetProject} />
    );
  });
};

describe("ProjectAutocomplete", () => {
  it("updates project autocomplete", async () => {
    await renderAutocomplete();
    expect(
      screen.queryByText(ProjectAutocompleteTextId.MenuItemOff)
    ).toBeTruthy();
    expect(screen.queryByText(ProjectAutocompleteTextId.MenuItemOn)).toBeNull();

    await userEvent.click(screen.getByRole("combobox"));
    await userEvent.click(
      screen.getByText(ProjectAutocompleteTextId.MenuItemOn)
    );
    expect(mockSetProject).toHaveBeenCalledWith({
      ...mockProject,
      autocompleteSetting: OffOnSetting.On,
    });
  });
});
