import "@testing-library/jest-dom";
import { act, render, screen } from "@testing-library/react";

import { type Project } from "api/models";
import ChooseProject from "components/ProjectScreen/ChooseProject";
import { newProject } from "types/project";
import { randomIntString } from "utilities/utilities";

jest.mock("backend", () => ({
  getAllActiveProjects: () => mockGetProjects(),
}));
jest.mock("rootRedux/hooks");
jest.mock("react-router-dom", () => ({
  useNavigate: jest.fn(),
}));

const mockGetProjects = jest.fn();
const mockProj = (name: string): Project => ({
  ...newProject(name),
  id: randomIntString(),
});

it("renders with projects in alphabetical order", async () => {
  const unordered = ["In the middle", "should be last", "álphabetically first"];
  mockGetProjects.mockResolvedValue(unordered.map((name) => mockProj(name)));
  await act(async () => {
    render(<ChooseProject />);
  });
  const items = screen.getAllByRole("listitem");
  expect(items).toHaveLength(unordered.length);
  expect(items[0]).not.toHaveTextContent(unordered[0]);
  expect(items[1]).not.toHaveTextContent(unordered[1]);
  expect(items[2]).not.toHaveTextContent(unordered[2]);
  expect(items[0]).toHaveTextContent(unordered[2]);
  expect(items[1]).toHaveTextContent(unordered[0]);
  expect(items[2]).toHaveTextContent(unordered[1]);
});
