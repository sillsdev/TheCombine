import { ListItemButton } from "@mui/material";
import renderer from "react-test-renderer";

import "tests/reactI18nextMock";

import { Project } from "api/models";
import ChooseProject from "components/ProjectScreen/ChooseProject";
import { newProject } from "types/project";

jest.mock("backend", () => ({
  getAllActiveProjectsByUser: () => mockGetProjects(),
}));
jest.mock("backend/localStorage", () => ({
  getUserId: () => "mockId",
}));
jest.mock("types/hooks");

const mockGetProjects = jest.fn();
const mockProj = (id: string): Project => ({ ...newProject(id), id });

let testRenderer: renderer.ReactTestRenderer;

it("renders with 2 projects", async () => {
  mockGetProjects.mockResolvedValue([mockProj("0"), mockProj("1")]);
  await renderer.act(async () => {
    testRenderer = renderer.create(<ChooseProject />);
  });
  expect(testRenderer.root.findAllByType(ListItemButton)).toHaveLength(2);
});
