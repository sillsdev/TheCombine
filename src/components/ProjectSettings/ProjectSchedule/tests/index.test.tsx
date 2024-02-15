import { Button, IconButton } from "@mui/material";
import { type ReactTestRenderer, act, create } from "react-test-renderer";

import "tests/reactI18nextMock";

import { Project } from "api/models";
import ProjectSchedule from "components/ProjectSettings/ProjectSchedule";
import { newProject } from "types/project";

const mockSetProject = jest.fn();

let projectMaster: ReactTestRenderer;

function mockProject(sched?: string[]): Project {
  return { ...newProject(), workshopSchedule: sched ?? [] };
}

const renderProjSched = async (
  project = mockProject(),
  readOnly = false
): Promise<void> => {
  mockSetProject.mockResolvedValue(undefined);
  await act(async () => {
    projectMaster = create(
      <ProjectSchedule
        project={project}
        readOnly={readOnly}
        setProject={mockSetProject}
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
    expect(projectMaster.root.findAllByType(Button)).toHaveLength(0);
    expect(projectMaster.root.findAllByType(IconButton)).toHaveLength(0);
  });
});
