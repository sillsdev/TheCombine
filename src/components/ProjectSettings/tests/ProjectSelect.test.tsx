import "@testing-library/jest-dom";
import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import ProjectSelect from "components/ProjectSettings/ProjectSelect";
import { newProject, randomProject } from "types/project";

jest.mock("backend", () => ({
  getAllActiveProjects: () => mockGetAllActiveProjects(),
}));

const mockGetAllActiveProjects = jest.fn();

const mockProjects = [randomProject(), randomProject(), randomProject()];

const renderSwitch = async (proj = newProject()): Promise<void> => {
  await act(async () => {
    render(<ProjectSelect project={proj} setProject={jest.fn()} />);
  });
};

describe("ProjectSelect", () => {
  it("has the current project selected and the correct number of options", async () => {
    mockGetAllActiveProjects.mockResolvedValueOnce(mockProjects);
    const selectedIndex = 1;
    await renderSwitch(mockProjects[selectedIndex]);
    mockProjects.forEach((proj, i) => {
      if (i === selectedIndex) {
        expect(screen.queryByText(proj.name)).toBeTruthy();
      } else {
        expect(screen.queryByText(proj.name)).toBeNull();
      }
    });

    await userEvent.click(screen.getByRole("combobox"));
    const options = screen.getAllByRole("option");
    expect(options).toHaveLength(mockProjects.length);
  });
});
