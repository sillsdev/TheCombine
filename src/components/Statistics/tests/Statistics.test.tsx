import renderer, { ReactTestRenderer } from "react-test-renderer";

import "tests/mockReactI18next";
import Statistics from "../Statistics";
import { newProject } from "types/project";

jest.mock("backend", () => ({
  getSemanticDomainCounts: (projectId: string, lang?: string) =>
    mockGetStatisticsCounts(projectId, lang),
  getProject: (projectId: string) => mockGetProject(projectId),
}));

jest.mock("backend/localStorage", () => ({
  getProjectId: () => mockGetProjectId(),
}));

const mockGetStatisticsCounts = jest.fn();
const mockGetProject = jest.fn();
const mockGetProjectId = jest.fn();

const mockProject = newProject();
const mockProjectId = "mockProject";

function setMockFunctions() {
  mockGetProjectId.mockReturnValue(mockProjectId);
  mockGetProject.mockResolvedValue(mockProject);
}

beforeEach(async () => {
  jest.clearAllMocks();
  setMockFunctions();
  await renderer.act(async () => {
    testRenderer = renderer.create(<Statistics />);
  });
});

let testRenderer: ReactTestRenderer;

describe("Statistics", () => {
  it("renders without crashing", () => {
    expect(testRenderer.toJSON()).toMatchSnapshot();
  });
});
