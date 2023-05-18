import { StyledEngineProvider, ThemeProvider } from "@mui/material/styles";
import renderer from "react-test-renderer";

import "tests/reactI18nextMock";

import Statistics from "components/Statistics/Statistics";
import { newProject } from "types/project";
import theme from "types/theme";

let testRenderer: renderer.ReactTestRenderer;

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
    testRenderer = renderer.create(
      <StyledEngineProvider injectFirst>
        <ThemeProvider theme={theme}>
          <Statistics />{" "}
        </ThemeProvider>
      </StyledEngineProvider>
    );
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
