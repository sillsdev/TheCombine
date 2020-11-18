import React from "react";
import ReactDOM from "react-dom";
import { Provider } from "react-redux";
import configureMockStore from "redux-mock-store";
import thunk from "redux-thunk";

import { Goal } from "../../../../types/goals";
import { User } from "../../../../types/user";
import { MergeDups } from "../../../MergeDupGoal/MergeDups";
import { ValidateChars } from "../../../ValidateChars/ValidateChars";
import BaseGoalScreen from "../BaseGoalScreen";

const createMockStore = configureMockStore([thunk]);
const mockStoreState = {
  mergeDuplicateGoal: {
    data: {
      words: {},
      senses: {},
    },
    tree: {
      senses: {},
      words: {},
    },
  },
  goalsState: {
    historyState: {
      history: [{ currentStep: 1, numSteps: 5 }],
    },
  },
};
const mockUser: User = new User("TestUser", "TestUsername", "TestPass");

it("renders without crashing", () => {
  const mockStore = createMockStore(mockStoreState);
  const div = document.createElement("div");
  const goal: Goal = new MergeDups();
  goal.user = mockUser;
  ReactDOM.render(
    <Provider store={mockStore}>
      <BaseGoalScreen goal={goal} />
    </Provider>,
    div
  );
  ReactDOM.unmountComponentAtNode(div);
});

it("renders without crashing when given goal with non-existent steps", () => {
  const mockStore = createMockStore(mockStoreState);
  const div = document.createElement("div");
  const goal: Goal = new ValidateChars();
  goal.user = mockUser;
  ReactDOM.render(
    <Provider store={mockStore}>
      <BaseGoalScreen goal={goal} />
    </Provider>,
    div
  );
  ReactDOM.unmountComponentAtNode(div);
});

it("renders without crashing when given undefined goal", () => {
  const mockStore = createMockStore(mockStoreState);
  const div = document.createElement("div");
  ReactDOM.render(
    <Provider store={mockStore}>
      <BaseGoalScreen />
    </Provider>,
    div
  );
  ReactDOM.unmountComponentAtNode(div);
});
