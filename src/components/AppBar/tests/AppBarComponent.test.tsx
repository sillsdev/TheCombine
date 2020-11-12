import React from "react";
import { Provider } from "react-redux";
import renderer, { ReactTestRenderer } from "react-test-renderer";
import configureMockStore from "redux-mock-store";

import { path } from "../../../history";
import { defaultState } from "../../App/DefaultState";
import AppBarComponent from "../AppBarComponent";
import NavigationButtons from "../NavigationButtons";
import ProjectNameButton from "../ProjectNameButton";

const createMockStore = configureMockStore([]);
const mockStore = createMockStore(defaultState);

let testRenderer: ReactTestRenderer;

describe("AppBarComponent", () => {
  it("renders without crashing", () => {
    renderer.act(() => {
      testRenderer = renderer.create(
        <Provider store={mockStore}>
          <AppBarComponent currentTab={path.projScreen} />
        </Provider>
      );
    });
  });
});

describe("NavigationButtons", () => {
  it("has only one tab shaded", () => {
    testRenderer = renderer
      .create(
        <Provider store={mockStore}>
          <NavigationButtons currentTab={path.goals} />
        </Provider>
      );
    expect(testRenderer.toJSON()).toMatchSnapshot();

    testRenderer = renderer
      .create(
        <Provider store={mockStore}>
          <ProjectNameButton currentTab={path.goals} />
        </Provider>
      );
    expect(testRenderer.toJSON()).toMatchSnapshot();
  });
});

describe("ProjectNameButton", () => {
  it("has tab shaded when itself is called", () => {
    testRenderer = renderer
      .create(
        <Provider store={mockStore}>
          <ProjectNameButton currentTab={path.projSettings} />
        </Provider>
      );
    expect(testRenderer.toJSON()).toMatchSnapshot();
  });
});
