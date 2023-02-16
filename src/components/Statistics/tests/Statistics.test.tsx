import renderer, {
  ReactTestInstance,
  ReactTestRenderer,
} from "react-test-renderer";

import "tests/mockReactI18next";

import Statistics from "components/Statistics/Statistics";
import { newProject } from "types/project";

let testRenderer: ReactTestRenderer;

const mockProject = newProject();
const mockProjectId = "mockProjectId";

const mockGetProject = jest.fn();
const mockGetProjectId = jest.fn();
const mockGetDomainUserCounts = jest.fn();
const mockGetSemanticDomainCounts = jest.fn();

jest.mock("backend", () => ({
  getProject: (projectId: string) => mockGetProject(projectId),
  getSemanticDomainUserCount: () => mockGetDomainUserCounts(),
  getSemanticDomainCounts: () => mockGetSemanticDomainCounts(),
}));

jest.mock("backend/localStorage", () => ({
  getProjectId: () => mockGetProjectId(),
}));

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

describe("Statistics", () => {
  it("renders without crashing, UI does not change unexpectedly", async () => {
    expect(testRenderer.toJSON()).toMatchSnapshot();
  });
  it("useEffect hook was called", async () => {
    //Verify the mock function called
    expect(mockGetProject).toBeCalled();
    expect(mockGetProjectId).toBeCalled();
  });
});
