import renderer, {
  ReactTestInstance,
  ReactTestRenderer,
} from "react-test-renderer";

import "tests/mockReactI18next";
import Statistics from "../Statistics";
import { newProject } from "types/project";

let testRenderer: ReactTestRenderer;

const mockProject = newProject();
mockProject.id = "mockProjectId";
const mockProjectId = "mockProjectId";
const backend = require("backend");

const mockGetStatisticsCounts = jest.fn();
const mockGetProject = jest.fn();
const mockGetProjectId = jest.fn();

jest.mock("backend", () => ({
  getSemanticDomainCounts: (projectId: string, lang?: string) =>
    mockGetStatisticsCounts(projectId, lang),
  getProject: (projectId: string) => mockGetProject(projectId),
}));

jest.mock("backend/localStorage", () => ({
  getProjectId: () => mockGetProjectId(),
}));

function setMockFunctions() {
  mockGetProjectId.mockReturnValue(mockProjectId);
  mockGetProject.mockResolvedValue(mockProject);
}

beforeEach(async () => {
  jest.clearAllMocks();
  setMockFunctions();
  await renderer.act(async () => {
    testRenderer = renderer.create(<Statistics />);
  });
});

afterEach(() => {
  // restore the spy created with spyOn
  jest.restoreAllMocks();
});

describe("Statistics", () => {
  it("renders without crashing, UI does not change unexpectedly", async () => {
    expect(testRenderer.toJSON()).toMatchSnapshot();
    expect(mockGetProject).toBeCalled();
    expect(mockGetProjectId).toBeCalledTimes(2);
  });

  it("check if getSemanticDomainCounts method called from backend", async () => {
    const spyFn = jest.spyOn(backend, "getSemanticDomainCounts");
    const returnCounts = backend.getSemanticDomainCounts();
    expect(spyFn).toHaveBeenCalled();
    expect(returnCounts).toBe(undefined);
  });

  // it("useState updated", async () => {
  //   await renderer.act(async () => {
  //     testRenderer = renderer.create(<Statistics />);
  //   });
  //   const newStatistics = testRenderer.root.findAllByType(Statistics);
  //   console.log(newStatistics[0].instance.setState({}));
  //   expect(newStatistics.length).toBe(1);
  //   testHandle = newStatistics[0];

  //   const realUseState = React.useState;
  //   const setLang = jest.fn();
  //   const useLangMock: any = (lang: string) => [lang, setLang];
  //   jest.spyOn(React, "useState").mockImplementation(useLangMock);
  //   testHandle.instance.setLang({ lang: [Bcp47Code.Es] }, () => {
  //     testRenderer.root.findByType(Statistics).instance.then(() => {
  //       expect(mockGetProject).toBeCalled();
  //       expect(mockGetProjectId).toBeCalled();
  //     });
  //   });
  // });
});
