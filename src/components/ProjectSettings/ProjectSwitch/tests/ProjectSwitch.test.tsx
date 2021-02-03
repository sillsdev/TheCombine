import { ListItem } from "@material-ui/core";
import React from "react";
import { Provider } from "react-redux";
import renderer, { ReactTestRenderer } from "react-test-renderer";
import configureMockStore from "redux-mock-store";

import { defaultProject, randomProject } from "types/project";
import { ProjectSwitch } from "components/ProjectSettings/ProjectSwitch/ProjectSwitch";

const projects = [randomProject(), randomProject(), randomProject()];
var switchMaster: ReactTestRenderer;
var switchHandle: ProjectSwitch;

const createMockStore = configureMockStore([]);

describe("ProjectSwitch", () => {
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

  it("generates correct number of ListItems", () => {
    switchHandle.setState({ projectList: projects });
    expect(switchMaster.root.findAllByType(ListItem).length).toEqual(
      projects.length
    );
  });
});
