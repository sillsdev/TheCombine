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

const findText = (item: renderer.ReactTestInstance, text: string) => {
  return item.find(
    (node) => node.children.length === 1 && node.children[0] === text
  );
};

it("renders with projects in alphabetical order", async () => {
  const unordered = ["In the middle", "should be last", "alphabetically first"];
  mockGetProjects.mockResolvedValue(unordered.map((name) => mockProj(name)));
  await renderer.act(async () => {
    testRenderer = renderer.create(<ChooseProject />);
  });
  const items = testRenderer.root.findAllByType(ListItemButton);
  expect(items).toHaveLength(unordered.length);
  expect(() => findText(items[0], unordered[0])).toThrow;
  expect(() => findText(items[1], unordered[1])).toThrow;
  expect(() => findText(items[2], unordered[2])).toThrow;
  expect(findText(items[0], unordered[2])).toBeTruthy;
  expect(findText(items[1], unordered[0])).toBeTruthy;
  expect(findText(items[2], unordered[1])).toBeTruthy;
});
