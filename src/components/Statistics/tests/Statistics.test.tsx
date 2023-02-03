import { newProject } from "types/project";

describe("temp", () => {
  it("temp", () => {
    var temp = newProject();
    expect(temp).not.toBeNull();
  });
});

// import { ListItem } from "@material-ui/core";
// import renderer, {
//   ReactTestInstance,
//   ReactTestRenderer,
// } from "react-test-renderer";

// import "tests/mockReactI18next";

// import { SemanticDomainCount } from "api";
// import Statistics from "components/Statistics/Statistics";
// import { newProject } from "types/project";
// import {
//   newSemanticDomainCount,
//   newSemanticDomainTreeNode,
// } from "types/semanticDomain";

// let testRenderer: ReactTestRenderer;

// const mockProject = newProject();
// const mockProjectId = "mockProjectId";
// const mockTreeNode = newSemanticDomainTreeNode();
// const mockSemanticDomainCountArray: Array<SemanticDomainCount> = [
//   newSemanticDomainCount(mockTreeNode),
// ];

// const mockGetStatisticsCounts = jest.fn();
// const mockGetProject = jest.fn();
// const mockGetProjectId = jest.fn();

// jest.mock("backend", () => ({
//   getSemanticDomainCounts: (projectId: string, lang?: string) =>
//     mockGetStatisticsCounts(projectId, lang),
//   getProject: (projectId: string) => mockGetProject(projectId),
// }));

// jest.mock("backend/localStorage", () => ({
//   getProjectId: () => mockGetProjectId(),
// }));

// function setMockFunctions() {
//   mockGetProjectId.mockReturnValue(mockProjectId);
//   mockGetProject.mockResolvedValue(mockProject);
//   mockGetStatisticsCounts.mockResolvedValue(mockSemanticDomainCountArray);
// }

// beforeEach(async () => {
//   jest.clearAllMocks();
//   setMockFunctions();
//   await renderer.act(async () => {
//     testRenderer = renderer.create(<Statistics />);
//   });
// });

// describe("Statistics", () => {
//   it("renders without crashing, UI does not change unexpectedly", async () => {
//     expect(testRenderer.toJSON()).toMatchSnapshot();
//   });

//   it("useEffect hook was called", async () => {
//     // Verify the mock function called
//     expect(mockGetProject).toBeCalled();
//     expect(mockGetProjectId).toBeCalled();
//     expect(mockGetStatisticsCounts).toBeCalledTimes(1);

//     // Verify ListItem for the SemanticDomainCount object is present
//     const newSenDomCountList = testRenderer.root.findAllByType(ListItem);
//     expect(newSenDomCountList.length).toEqual(
//       mockSemanticDomainCountArray.length
//     );
//   });
// });
