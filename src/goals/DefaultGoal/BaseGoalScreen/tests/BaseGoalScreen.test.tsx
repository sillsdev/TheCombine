import React from "react";
import ReactDOM from "react-dom";
import { User } from "../../../../types/user";
import { Goal } from "../../../../types/goals";
import BaseGoalScreen from "../BaseGoalScreen";
import { MergeDups } from "../../../MergeDupGoal/MergeDups";
import { Provider } from "react-redux";
import configureMockStore from "redux-mock-store";
import thunk from "redux-thunk";
import { ValidateChars } from "../../../ValidateChars/ValidateChars";

const createMockStore = configureMockStore([thunk]);

const mockStoreState = {
  mergeDuplicateGoal: {
    mergeTreeState: {
      data: {
        words: {},
        senses: {}
      },
      tree: {
        senses: {},
        words: {}
      }
    },
    wordDragState: {
      draggedWord: undefined
    }
  },
  goalsState: {
    historyState: {
      history: [{ currentStep: 1, numSteps: 5 }]
    }
  }
};

it("renders without crashing", () => {
  const mockStore = createMockStore(mockStoreState);

  const div = document.createElement("div");
  let user: User = new User("TestUser", "TestUsername", "password");
  let goal: Goal = new MergeDups();
  goal.user = user;
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
  let user: User = new User("TestUser", "TestUsername", "password");
  let goal: Goal = new ValidateChars();
  goal.user = user;
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
