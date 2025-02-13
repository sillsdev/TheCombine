import { ListItem } from "@mui/material";
import { act } from "react";
import renderer from "react-test-renderer";

import { ProjectList } from "components/SiteSettings/ProjectManagement";
import { randomProject } from "types/project";

const mockProjects = [randomProject(), randomProject(), randomProject()];

let testRenderer: renderer.ReactTestRenderer;

beforeAll(async () => {
  await act(async () => {
    testRenderer = renderer.create(
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
    const projectList = testRenderer.root.findAllByType(ListItem);
    expect(projectList.length).toEqual(mockProjects.length);
  });
});
