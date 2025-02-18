import { StyledEngineProvider, ThemeProvider } from "@mui/material/styles";
import { act, render } from "@testing-library/react";

import Statistics from "components/Statistics/Statistics";
import { newProject } from "types/project";
import theme from "types/theme";

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
    render(
      <StyledEngineProvider injectFirst>
        <ThemeProvider theme={theme}>
          <Statistics />{" "}
        </ThemeProvider>
      </StyledEngineProvider>
    );
  });
});

describe("Statistics", () => {
  it("useEffect hook was called", async () => {
    expect(mockGetProject).toHaveBeenCalled();
    expect(mockGetProjectId).toHaveBeenCalled();
  });
});
