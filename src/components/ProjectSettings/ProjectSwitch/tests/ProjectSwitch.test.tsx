import renderer, { ReactTestRenderer } from "react-test-renderer";
import TestRenderer from "react-test-renderer";
import { ProjectSwitch } from "../ProjectSwitch";
import React from "react";
import { ListItem } from "@material-ui/core";
import { defaultProject } from "../../../../types/project";
import configureMockStore from "redux-mock-store";
import { Provider } from "react-redux";

const projects = [defaultProject, defaultProject, defaultProject];
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
      switchMaster = TestRenderer.create(
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
