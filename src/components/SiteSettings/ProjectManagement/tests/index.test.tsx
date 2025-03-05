import { act, render, screen } from "@testing-library/react";

import { ProjectList } from "components/SiteSettings/ProjectManagement";
import { randomProject } from "types/project";

const mockProjects = [randomProject(), randomProject(), randomProject()];

beforeAll(async () => {
  await act(async () => {
    render(
      <ProjectList
        activeProjects={mockProjects}
        archivedProjects={[]}
        updateProjects={jest.fn()}
      />
    );
  });
});

describe("ProjectList", () => {
  it("Has the right number of projects listed", () => {
    const ListItems = screen.queryAllByRole("listitem");
    // The list has two extra items for the active and archived project ListSubheaders.
    expect(ListItems.length).toEqual(mockProjects.length + 2);
  });
});
