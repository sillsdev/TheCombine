import { Select } from "@mui/material";
import renderer from "react-test-renderer";

import ProjectSelect from "components/ProjectSettings/ProjectSelect";
import { newProject, randomProject } from "types/project";

jest.mock("backend", () => ({
  getAllActiveProjectsByUser: () => mockGetAllActiveProjectsByUser(),
}));
jest.mock("backend/localStorage", () => ({
  getUserId: () => "nonempty-string",
}));

const mockGetAllActiveProjectsByUser = jest.fn();

const mockProjects = [randomProject(), randomProject(), randomProject()];

let selectMaster: renderer.ReactTestRenderer;

const renderSwitch = async (proj = newProject()) => {
  await renderer.act(async () => {
    selectMaster = renderer.create(
      <ProjectSelect project={proj} setProject={jest.fn()} />
    );
  });
};

describe("ProjectSelect", () => {
  it("has the correct number of options and the current project selected", async () => {
    mockGetAllActiveProjectsByUser.mockResolvedValueOnce(mockProjects);
    await renderSwitch(mockProjects[1]);
    const select = selectMaster.root.findByType(Select);
    expect(select.props.children).toHaveLength(mockProjects.length);
    expect(select.props.value).toEqual(mockProjects[1].name);
  });
});
