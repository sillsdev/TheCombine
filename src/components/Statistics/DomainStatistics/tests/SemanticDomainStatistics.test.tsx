import { ListItem } from "@material-ui/core";
import renderer, { ReactTestRenderer } from "react-test-renderer";

import "tests/mockReactI18next";

import { SemanticDomainCount } from "api";
import SemanticDomainStatistics from "components/Statistics/DomainStatistics/SemanticDomainStatistics";
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

function setMockFunctions() {
  mockGetProjectId.mockReturnValue(mockProjectId);
  mockGetStatisticsCounts.mockResolvedValue(mockSemanticDomainCountArray);
}

beforeEach(async () => {
  jest.clearAllMocks();
  setMockFunctions();
  await renderer.act(async () => {
    testRenderer = renderer.create(<SemanticDomainStatistics lang={""} />);
  });
});

describe("SemanticDomainStatistics", () => {
  it("renders without crashing, UI does not change unexpectedly", async () => {
    expect(testRenderer.toJSON()).toMatchSnapshot();
  });

  it("useEffect hook was called", async () => {
    //Verify the mock function called
    expect(mockGetProjectId).toBeCalled();

    //Verify ListItem for the SemanticDomainCount object is present
    const newSenDomCountList = testRenderer.root.findAllByType(ListItem);
    expect(newSenDomCountList.length).toEqual(
      mockSemanticDomainCountArray.length
    );
  });
});
