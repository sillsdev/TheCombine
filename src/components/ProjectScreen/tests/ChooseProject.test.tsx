import { ListItemButton } from "@mui/material";
import renderer from "react-test-renderer";

import "tests/reactI18nextMock";

import { Project } from "api/models";
import ChooseProject from "components/ProjectScreen/ChooseProject";
import { newProject } from "types/project";
import { randomIntString } from "utilities/utilities";

jest.mock("backend", () => ({
  getAllActiveProjectsByUser: () => mockGetProjects(),
}));
jest.mock("backend/localStorage", () => ({
  getUserId: () => "mockId",
}));
jest.mock("types/hooks");
jest.mock("react-router-dom", () => ({
  useNavigate: jest.fn(),
}));

const mockGetProjects = jest.fn();
const mockProj = (name: string): Project => ({
  ...newProject(name),
  id: randomIntString(),
});

let testRenderer: renderer.ReactTestRenderer;

const hasText = (item: renderer.ReactTestInstance, text: string): boolean => {
  const found = item.findAll(
    (node) => node.children.length === 1 && node.children[0] === text
  );
  return found.length !== 0;
};

it("renders with projects in alphabetical order", async () => {
  const unordered = ["In the middle", "should be last", "alphabetically first"];
  mockGetProjects.mockResolvedValue(unordered.map((name) => mockProj(name)));
  await renderer.act(async () => {
    testRenderer = renderer.create(<ChooseProject />);
  });
  const items = testRenderer.root.findAllByType(ListItemButton);
  expect(items).toHaveLength(unordered.length);
  expect(hasText(items[0], unordered[0])).toBeFalsy;
  expect(hasText(items[1], unordered[1])).toBeFalsy;
  expect(hasText(items[2], unordered[2])).toBeFalsy;
  expect(hasText(items[0], unordered[2])).toBeTruthy;
  expect(hasText(items[1], unordered[0])).toBeTruthy;
  expect(hasText(items[2], unordered[1])).toBeTruthy;
});
