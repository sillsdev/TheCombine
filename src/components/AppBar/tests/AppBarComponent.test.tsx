import React from "react";
import ReactDOM from "react-dom";
import { Provider } from "react-redux";
import renderer from "react-test-renderer";
import configureMockStore from "redux-mock-store";

import { path } from "../../../history";
import { defaultState } from "../../App/DefaultState";
import AppBarComponent from "../AppBarComponent";
import NavigationButtons from "../NavigationButtons";
import ProjectNameButton from "../ProjectNameButton";

const createMockStore = configureMockStore([]);
const mockStore = createMockStore(defaultState);

describe("AppBarComponent", () => {
  it("renders without crashing", () => {
    const div = document.createElement("div");
    ReactDOM.render(
      <Provider store={mockStore}>
        <AppBarComponent currentTab={path.goals} />
      </Provider>,
      div
    );
    ReactDOM.unmountComponentAtNode(div);
  });

  it("has only one tab shaded", () => {
    const NavigationButtonRender = renderer
      .create(
        <Provider store={mockStore}>
          <NavigationButtons currentTab={path.goals} />
        </Provider>
      )
      .toJSON();
    expect(NavigationButtonRender).toMatchSnapshot();

    const ProjectButtonRender = renderer
      .create(
        <Provider store={mockStore}>
          <ProjectNameButton currentTab={path.goals} />
        </Provider>
      )
      .toJSON();
    expect(ProjectButtonRender).toMatchSnapshot();
  });

  it("has ProjectName tab shaded when itself is called", () => {
    const ProjectButtonRender = renderer
      .create(
        <Provider store={mockStore}>
          <ProjectNameButton currentTab={path.projSettings} />
        </Provider>
      )
      .toJSON();
    expect(ProjectButtonRender).toMatchSnapshot();
  });
});
