import { StyledEngineProvider, ThemeProvider } from "@mui/material/styles";
import { ReactTestRenderer, act, create } from "react-test-renderer";

import Statistics from "components/Statistics/Statistics";
import { newProject } from "types/project";
import theme from "types/theme";

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

function setMockFunctions(): void {
  mockGetProjectId.mockReturnValue(mockProjectId);
  mockGetProject.mockResolvedValue(mockProject);
}

beforeEach(async () => {
  jest.clearAllMocks();
  setMockFunctions();
  await act(async () => {
    testRenderer = create(
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
    expect(mockGetProject).toHaveBeenCalled();
    expect(mockGetProjectId).toHaveBeenCalled();
  });
});
