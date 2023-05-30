import { ListItemButton } from "@mui/material";
import renderer from "react-test-renderer";

import { ProjectSwitch } from "components/ProjectSettings/ProjectSwitch";
import { newProject, randomProject } from "types/project";

jest.mock("backend", () => ({
  getAllActiveProjectsByUser: () => mockGetAllActiveProjectsByUser(),
}));
jest.mock("backend/localStorage", () => ({
  getUserId: () => "nonempty-string",
}));

const mockGetAllActiveProjectsByUser = jest.fn();

const mockProjects = [randomProject(), randomProject(), randomProject()];

let switchMaster: renderer.ReactTestRenderer;

const renderSwitch = async () => {
  await renderer.act(async () => {
    switchMaster = renderer.create(
      <ProjectSwitch project={newProject()} setProject={jest.fn()} />
    );
  });
};

describe("ProjectSwitch", () => {
  it("generates correct number of ListItems", async () => {
    mockGetAllActiveProjectsByUser.mockResolvedValueOnce(mockProjects);
    await renderSwitch();
    expect(switchMaster.root.findAllByType(ListItemButton)).toHaveLength(
      mockProjects.length
    );
  });
});
