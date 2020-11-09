import { LanguagePicker } from "mui-language-picker";
import React from "react";
import { Provider } from "react-redux";
import renderer, {
  ReactTestInstance,
  ReactTestRenderer,
} from "react-test-renderer";
import configureMockStore from "redux-mock-store";

import {
  defaultProject,
  Project,
  WritingSystem,
} from "../../../../types/project";
import { defaultState } from "../../../App/DefaultState";
import ProjectLanguages from "../ProjectLanguages";

jest.mock("../../../../backend", () => {
  return { updateProject: (proj: Project) => mockUpdateProject(proj) };
});

const createMockStore = configureMockStore([]);
const mockStore = createMockStore(defaultState);
const mockAnalysisWritingSystems: WritingSystem[] = [
  { name: "a", bcp47: "a", font: "" },
  { name: "b", bcp47: "b", font: "" },
];
const mockUpdateProject = jest.fn((proj: Project) => {
  return Promise.resolve(proj);
});

let projectMaster: ReactTestRenderer;
let projectHandle: ReactTestInstance;

function mockProject(systems?: WritingSystem[]) {
  return { ...defaultProject, analysisWritingSystems: systems ?? [] };
}

function renderProjLangs(proj: Project) {
  renderer.act(() => {
    projectMaster = renderer.create(
      <Provider store={mockStore}>
        <ProjectLanguages project={proj} />
      </Provider>
    );
  });
}

describe("ProjectLanguages", () => {
  it("renders without crashing", () => {
    renderProjLangs(mockProject([...mockAnalysisWritingSystems]));
  });

  it("can add language to project", () => {
    renderProjLangs(mockProject([...mockAnalysisWritingSystems]));
    expect(projectMaster.root.findAllByType(LanguagePicker).length).toEqual(0);
    projectMaster.root.findByProps({ id: "addNewLang" }).props.onClick();
    expect(projectMaster.root.findAllByType(LanguagePicker).length).toEqual(1);
    projectHandle = projectMaster.root.findByType(LanguagePicker);
    projectHandle.props.setCode("z");
    projectHandle.props.setName("z");
    projectMaster.root.findByProps({ id: "submitNewLang" }).props.onClick();
    expect(mockUpdateProject).toBeCalledWith(
      mockProject([
        ...mockAnalysisWritingSystems,
        { name: "z", bcp47: "z", font: "" },
      ])
    );
  });
});
