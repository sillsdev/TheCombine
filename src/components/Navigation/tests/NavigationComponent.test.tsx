import React from "react";
import ReactDOM from "react-dom";
import configureMockStore from "redux-mock-store";
import { defaultState } from "../../App/DefaultState";
import { Provider } from "react-redux";
import ConnectedNavigation from "..";
import NonConnectedNavigation from "../NavigationComponent";
import { GoalTimeline } from "../../GoalTimeline/GoalTimelineComponent";

const createMockStore = configureMockStore([]);

it("renders without crashing", () => {
  const mockStore = createMockStore(defaultState);
  const visibleComponent = <GoalTimeline />;
  const div = document.createElement("div");
  ReactDOM.render(
    <Provider store={mockStore}>
      <NonConnectedNavigation VisibleComponent={visibleComponent} />
    </Provider>,
    div
  );
  ReactDOM.unmountComponentAtNode(div);
});

it("renders without crashing", () => {
  const mockStore = createMockStore(defaultState);
  const div = document.createElement("div");
  ReactDOM.render(
    <Provider store={mockStore}>
      <ConnectedNavigation />
    </Provider>,
    div
  );
  ReactDOM.unmountComponentAtNode(div);
});
