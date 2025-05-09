import { act, render, screen } from "@testing-library/react";

import { SemanticDomainUserCount } from "api/models";
import UserStatistics from "components/Statistics/UserStatistics";
import { newSemanticDomainUserCount } from "types/semanticDomain";

const mockProjectId = "mockProjectId";
const mockSemanticDomainUserCount = newSemanticDomainUserCount();
const mockSemanticDomainUserCountArray: Array<SemanticDomainUserCount> = [
  mockSemanticDomainUserCount,
];

const mockGetDomainSenseUserStatistics = jest.fn();
const mockGetProjectId = jest.fn();

jest.mock("backend", () => ({
  getSemanticDomainUserCount: (projectId: string, lang?: string) =>
    mockGetDomainSenseUserStatistics(projectId, lang),
}));

jest.mock("backend/localStorage", () => ({
  getProjectId: () => mockGetProjectId(),
}));

function setMockFunctions(): void {
  mockGetProjectId.mockReturnValue(mockProjectId);
  mockGetDomainSenseUserStatistics.mockResolvedValue(
    mockSemanticDomainUserCountArray
  );
}

beforeEach(async () => {
  jest.clearAllMocks();
  setMockFunctions();
  await act(async () => {
    render(<UserStatistics lang={""} />);
  });
});

describe("UserStatistics", () => {
  test("useEffect hook was called", async () => {
    expect(mockGetProjectId).toHaveBeenCalled();
  });

  test("all rows are present", async () => {
    const listItems = screen.queryAllByRole("row");
    expect(listItems.length).toEqual(
      mockSemanticDomainUserCountArray.length + 1
    );
  });
});
