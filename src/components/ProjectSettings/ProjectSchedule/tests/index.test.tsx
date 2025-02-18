import { act, render, screen } from "@testing-library/react";

import { Project } from "api/models";
import ProjectSchedule from "components/ProjectSettings/ProjectSchedule";
import { newProject } from "types/project";

const mockSetProject = jest.fn();

function mockProject(sched?: string[]): Project {
  return { ...newProject(), workshopSchedule: sched ?? [] };
}

const renderProjSched = async (
  project = mockProject(),
  readOnly = false
): Promise<void> => {
  mockSetProject.mockResolvedValue(undefined);
  await act(async () => {
    render(
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
    expect(screen.queryAllByRole("button")).toHaveLength(3);
  });

  it("renders readOnly with no buttons", async () => {
    await renderProjSched(undefined, true);
    expect(screen.queryAllByRole("button")).toHaveLength(0);
  });
});
