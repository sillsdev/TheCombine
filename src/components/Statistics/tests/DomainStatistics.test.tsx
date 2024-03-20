import { ListItem } from "@mui/material";
import { ReactTestRenderer, act, create } from "react-test-renderer";

import { SemanticDomainCount } from "api";
import DomainStatistics from "components/Statistics/DomainStatistics";
import {
  newSemanticDomainCount,
  newSemanticDomainTreeNode,
} from "types/semanticDomain";

let testRenderer: ReactTestRenderer;

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
  jest.clearAllMocks();
  setMockFunctions();
  await act(async () => {
    testRenderer = create(<DomainStatistics lang={""} />);
  });
});

describe("DomainStatistics", () => {
  it("renders without crashing, UI does not change unexpectedly", async () => {
    expect(testRenderer.toJSON()).toMatchSnapshot();
  });

  it("useEffect hook was called", async () => {
    //Verify the mock function called
    expect(mockGetProjectId).toHaveBeenCalled();

    //Verify ListItem for the SemanticDomainCount object is present
    const newSenDomCountList = testRenderer.root.findAllByType(ListItem);
    expect(newSenDomCountList.length).toEqual(
      mockSemanticDomainCountArray.length
    );
  });
});
