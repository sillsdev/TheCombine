import React from "react";
import ReactDOM from "react-dom";
import configureMockStore from "redux-mock-store";
import { defaultState } from "../../App/DefaultState";
import { Provider } from "react-redux";
import AppBarComponent from "../AppBarComponent";
import NavigationButtons from "../NavigationButtons";
import { CurrentTab } from "../../../types/currentTab";
import renderer from "react-test-renderer";
import ProjectNameButton from "../ProjectNameButton";

const createMockStore = configureMockStore([]);
const mockStore = createMockStore(defaultState);

describe("Tests AppBarComponent", () => {
  it("renders without crashing", () => {
    const div = document.createElement("div");
    ReactDOM.render(
      <Provider store={mockStore}>
        <AppBarComponent currentTab={CurrentTab.DataCleanup} />
      </Provider>,
      div
    );
    ReactDOM.unmountComponentAtNode(div);
  });

  it("Ensures only one tab is shaded", () => {
    const NavigationButtonRender = renderer
      .create(
        <Provider store={mockStore}>
          <NavigationButtons currentTab={CurrentTab.DataCleanup} />
        </Provider>
      )
      .toJSON();
    expect(NavigationButtonRender).toMatchSnapshot();

    const ProjectButtonRender = renderer
      .create(
        <Provider store={mockStore}>
          <ProjectNameButton currentTab={CurrentTab.DataCleanup} />
        </Provider>
      )
      .toJSON();
    expect(ProjectButtonRender).toMatchSnapshot();
  });

  it("Ensures ProjectName Tab is shaded when itself is called", () => {
    const ProjectButtonRender = renderer
      .create(
        <Provider store={mockStore}>
          <ProjectNameButton currentTab={CurrentTab.ProjectSettings} />
        </Provider>
      )
      .toJSON();
    expect(ProjectButtonRender).toMatchSnapshot();
  });
});
