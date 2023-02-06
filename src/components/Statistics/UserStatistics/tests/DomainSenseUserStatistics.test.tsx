import { ListItem } from "@material-ui/core";
import renderer, { ReactTestRenderer } from "react-test-renderer";

import "tests/mockReactI18next";

import { DomainSenseUserCount } from "api";
import DomainSenseUserStatistics from "components/Statistics/UserStatistics/DomainSenseUserStatistics";
import { newDomainSenseUserCount } from "types/semanticDomain";

let testRenderer: ReactTestRenderer;

const mockProjectId = "mockProjectId";
const mockDomainSenseUserCount = newDomainSenseUserCount();
const mockDomainSenseUserCountArray: Array<DomainSenseUserCount> = [
  mockDomainSenseUserCount,
];

const mockGetDomainSenseUserStatistics = jest.fn();
const mockGetProjectId = jest.fn();

jest.mock("backend", () => ({
  getDomainSenseUserCounts: (projectId: string, lang?: string) =>
    mockGetDomainSenseUserStatistics(projectId, lang),
}));

jest.mock("backend/localStorage", () => ({
  getProjectId: () => mockGetProjectId(),
}));

function setMockFunctions() {
  mockGetProjectId.mockReturnValue(mockProjectId);
  mockGetDomainSenseUserStatistics.mockResolvedValue(
    mockDomainSenseUserCountArray
  );
}

beforeEach(async () => {
  jest.clearAllMocks();
  setMockFunctions();
  await renderer.act(async () => {
    testRenderer = renderer.create(<DomainSenseUserStatistics lang={""} />);
  });
});

describe("SemanticDomainStatistics", () => {
  it("renders without crashing, UI does not change unexpectedly", async () => {
    expect(testRenderer.toJSON()).toMatchSnapshot();
  });

  it("useEffect hook was called", async () => {
    //Verify the mock function called
    expect(mockGetProjectId).toBeCalled();

    //Verify ListItem for the DomainSenseUserCount object is present
    const newSenDomCountList = testRenderer.root.findAllByType(ListItem);
    expect(newSenDomCountList.length).toEqual(
      mockDomainSenseUserCountArray.length
    );
  });
});
