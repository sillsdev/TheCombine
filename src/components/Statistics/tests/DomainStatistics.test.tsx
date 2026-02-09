import { act, render, screen } from "@testing-library/react";

import { SemanticDomainCount } from "api/models";
import DomainStatistics from "components/Statistics/DomainStatistics";
import {
  newSemanticDomainCount,
  newSemanticDomainTreeNode,
} from "types/semanticDomain";

const mockProjectId = "mockProjectId";
const mockTreeNode = newSemanticDomainTreeNode();
const mockSemanticDomainCountArray: Array<SemanticDomainCount> = [
  newSemanticDomainCount(mockTreeNode),
];

const mockGetStatisticsCounts = jest.fn();
const mockGetProjectId = jest.fn();

jest.mock("backend", () => ({
  getSemanticDomainCounts: (projectId: string, lang?: string) =>
    mockGetStatisticsCounts(projectId, lang),
}));

jest.mock("backend/localStorage", () => ({
  getProjectId: () => mockGetProjectId(),
}));

function setMockFunctions(): void {
  mockGetProjectId.mockReturnValue(mockProjectId);
  mockGetStatisticsCounts.mockResolvedValue(mockSemanticDomainCountArray);
}

beforeEach(async () => {
  setMockFunctions();
  await act(async () => {
    render(<DomainStatistics lang={""} />);
  });
});

describe("DomainStatistics", () => {
  test("useEffect hook was called", async () => {
    expect(mockGetProjectId).toHaveBeenCalled();
  });

  test("all rows are present", async () => {
    const expectedRowCount = mockSemanticDomainCountArray.length + 1; // +1 for the header row
    expect(screen.queryAllByRole("row")).toHaveLength(expectedRowCount);
  });
});
