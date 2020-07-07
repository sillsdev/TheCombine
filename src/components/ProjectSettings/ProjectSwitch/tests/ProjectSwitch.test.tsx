import { ListItem } from "@material-ui/core";
import React from "react";
import { Provider } from "react-redux";
import renderer, { ReactTestRenderer } from "react-test-renderer";
import configureMockStore from "redux-mock-store";

import { defaultProject, randomProject } from "../../../../types/project";
import { ProjectSwitch } from "../ProjectSwitch";

const projects = [randomProject(), randomProject(), randomProject()];
var switchMaster: ReactTestRenderer;
var switchHandle: ProjectSwitch;

const createMockStore = configureMockStore([]);

describe("Testing login component", () => {
  beforeAll(() => {
    const state = {
      currentProject: { defaultProject },
    };
    const mockStore = createMockStore(state);
    renderer.act(() => {
      switchMaster = renderer.create(
        <Provider store={mockStore}>
          <ProjectSwitch
            project={defaultProject}
            setCurrentProject={jest.fn()}
          />
        </Provider>
      );
    });
    switchHandle = switchMaster.root.findByType(ProjectSwitch).instance;
  });
  test("check if correct number of listitems generated", () => {
    switchHandle.setState({ projectList: projects });
    expect(switchHandle.state.projectList).toBeTruthy();
    let count = 0;
    switchHandle.getListItems().map((e) => {
      if (e.type === ListItem) count++;
    });
    expect(count).toEqual(3);
  });
});
