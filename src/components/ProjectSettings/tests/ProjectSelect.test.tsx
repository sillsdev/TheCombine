import { Select } from "@mui/material";
import { ReactTestRenderer, act, create } from "react-test-renderer";

import ProjectSelect from "components/ProjectSettings/ProjectSelect";
import { newProject, randomProject } from "types/project";

jest.mock("backend", () => ({
  getAllActiveProjects: () => mockGetAllActiveProjects(),
}));

const mockGetAllActiveProjects = jest.fn();

const mockProjects = [randomProject(), randomProject(), randomProject()];

let selectMaster: ReactTestRenderer;

const renderSwitch = async (proj = newProject()): Promise<void> => {
  await act(async () => {
    selectMaster = create(
      <ProjectSelect project={proj} setProject={jest.fn()} />
    );
  });
};

describe("ProjectSelect", () => {
  it("has the correct number of options and the current project selected", async () => {
    mockGetAllActiveProjects.mockResolvedValueOnce(mockProjects);
    await renderSwitch(mockProjects[1]);
    const select = selectMaster.root.findByType(Select);
    expect(select.props.children).toHaveLength(mockProjects.length);
    expect(select.props.value).toEqual(mockProjects[1].name);
  });
});
