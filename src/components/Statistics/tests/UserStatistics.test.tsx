import { ListItem } from "@mui/material";
import renderer from "react-test-renderer";

import "tests/reactI18nextMock";

import { SemanticDomainUserCount } from "api";
import UserStatistics from "components/Statistics/UserStatistics";
import { newSemanticDomainUserCount } from "types/semanticDomain";

let testRenderer: renderer.ReactTestRenderer;

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

function setMockFunctions() {
  mockGetProjectId.mockReturnValue(mockProjectId);
  mockGetDomainSenseUserStatistics.mockResolvedValue(
    mockSemanticDomainUserCountArray
  );
}

beforeEach(async () => {
  jest.clearAllMocks();
  setMockFunctions();
  await renderer.act(async () => {
    testRenderer = renderer.create(<UserStatistics lang={""} />);
  });
});

describe("UserStatistics", () => {
  it("renders without crashing, UI does not change unexpectedly", async () => {
    expect(testRenderer.toJSON()).toMatchSnapshot();
  });

  it("useEffect hook was called", async () => {
    //Verify the mock function called
    expect(mockGetProjectId).toBeCalled();

    //Verify ListItem for the DomainSenseUserCount object is present
    const newSenDomCountList = testRenderer.root.findAllByType(ListItem);
    expect(newSenDomCountList.length).toEqual(
      mockSemanticDomainUserCountArray.length
    );
  });
});
