import { ListItem } from "@mui/material";
import { ReactTestRenderer, act, create } from "react-test-renderer";

import "localization/mocks/reactI18nextMock";

import { SemanticDomainUserCount } from "api/models";
import UserStatistics from "components/Statistics/UserStatistics";
import { newSemanticDomainUserCount } from "types/semanticDomain";

let testRenderer: ReactTestRenderer;

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
    testRenderer = create(<UserStatistics lang={""} />);
  });
});

describe("UserStatistics", () => {
  it("renders without crashing, UI does not change unexpectedly", async () => {
    expect(testRenderer.toJSON()).toMatchSnapshot();
  });

  it("useEffect hook was called", async () => {
    //Verify the mock function called
    expect(mockGetProjectId).toHaveBeenCalled();

    //Verify ListItem for the DomainSenseUserCount object is present
    const newSenDomCountList = testRenderer.root.findAllByType(ListItem);
    expect(newSenDomCountList.length).toEqual(
      mockSemanticDomainUserCountArray.length
    );
  });
});
