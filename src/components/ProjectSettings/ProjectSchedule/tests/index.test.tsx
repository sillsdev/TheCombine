import { IconButton } from "@mui/material";
import renderer from "react-test-renderer";

import "tests/reactI18nextMock";

import { Project } from "api/models";
import ProjectSchedule from "components/ProjectSettings/ProjectSchedule";
import { newProject } from "types/project";

const mockUpdateProject = jest.fn();

let projectMaster: renderer.ReactTestRenderer;

function mockProject(sched?: string[]): Project {
  return { ...newProject(), workshopSchedule: sched ?? [] };
}

const renderProjSched = async (
  project = mockProject(),
  readOnly = false
): Promise<void> => {
  mockUpdateProject.mockResolvedValue(undefined);
  await renderer.act(async () => {
    projectMaster = renderer.create(
      <ProjectSchedule
        project={project}
        readOnly={readOnly}
        updateProject={mockUpdateProject}
      />
    );
  });
};

describe("ProjectSchedule", () => {
  it("renders with buttons", async () => {
    await renderProjSched();
    expect(projectMaster.root.findAllByType(IconButton)).toHaveLength(3);
  });

  it("renders readOnly with no buttons", async () => {
    await renderProjSched(undefined, true);
    expect(projectMaster.root.findAllByType(IconButton)).toHaveLength(0);
  });
});
