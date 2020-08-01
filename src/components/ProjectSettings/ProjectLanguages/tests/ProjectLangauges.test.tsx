import React from "react";
import { Provider } from "react-redux";
import renderer from "react-test-renderer";
import configureMockStore from "redux-mock-store";

import { defaultProject, Project } from "../../../../types/project";
import { defaultState } from "../../../App/DefaultState";
import ProjectLanguages from "../ProjectLanguages";

const createMockStore = configureMockStore([]);
const mockStore = createMockStore(defaultState);
let mockProject: Project = {
  ...defaultProject,
  analysisWritingSystems: [
    { name: "a", bcp47: "a", font: "" },
    { name: "b", bcp47: "b", font: "" },
  ],
};
describe("Testing login component", () => {
  it("Renders without crashing", () => {
    renderer.act(() => {
      renderer.create(
        <Provider store={mockStore}>
          <ProjectLanguages project={mockProject} />
        </Provider>
      );
    });
  });
});
