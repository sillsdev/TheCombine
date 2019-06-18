import React from "react";

import GoalSelectorScroll from "../";
import { Goal, GoalSelectorState } from "../../../../../types/goals";
import { BaseGoal } from "../../../../../types/baseGoal";
import { User } from "../../../../../types/user";
import { GoalSelectorScroll as GSScroll } from "../GoalSelectorScroll";
import { SELECT_ACTION } from "../GoalSelectorAction";

import configureMockStore from "redux-mock-store";
import thunk from "redux-thunk";
import { Provider } from "react-redux";
import { act } from "react-dom/test-utils";
import renderer, {
  ReactTestInstance,
  ReactTestRenderer
} from "react-test-renderer";

const labels: string[] = ["handleDuplicates", "handleFlags", "grammarCheck"];

// Create the mock store
const gsState: GoalSelectorState = createTempState();
const storeState: any = {
  goalSelectorState: gsState,
  goalsState: { goalOptions: gsState.goalOptions }
};
const createMockStore = configureMockStore([thunk]);
const store = createMockStore(storeState);

// Mock the DOM
jest.autoMockOn();

// Variables used in testing: contain various parts of the UI
var scrollMaster: ReactTestRenderer;
var scrollHandle: ReactTestInstance;

beforeEach(() => {
  // Reset store actions
  store.clearActions();

  // Here, use the act block to be able to render our GoalState into the DOM
  act(() => {
    scrollMaster = renderer.create(
      <Provider store={store}>
        <GoalSelectorScroll handleChange={jest.fn()} />
      </Provider>
    );
    scrollHandle = scrollMaster.root.findByType(GSScroll);
  });
});

// Actual tests
describe("Testing the goal selector scroll ui", () => {
  it("Constructs correctly", () => {
    // Default snapshot test
    snapTest("default view");
  });

  it("Dispatches ndx to store on left click", () => {
    try {
      // This relies on the dispatch to the store getting called before the call to
      // getScroll(), which fails in the testing environment
      // Yes, it's jank, but we couldn't find a better way.
      scrollHandle.instance.scrollLeft();
    } catch (e) {
      expect(store.getActions()).toEqual([
        {
          type: SELECT_ACTION,
          payload: 2
        }
      ]);
    }
  });

  it("Dispatches ndx to store on right click", () => {
    try {
      // Same as scrollLeft
      scrollHandle.instance.scrollRight();
    } catch (e) {
      expect(store.getActions()).toEqual([
        {
          type: SELECT_ACTION,
          payload: 1
        }
      ]);
    }
  });
});

// Perform a snapshot test
function snapTest(name: string) {
  expect(scrollMaster.toJSON()).toMatchSnapshot();
}

// Create a usable temporary state, as opposed to a dummy state
function createTempState(): GoalSelectorState {
  let tempUser: User = {
    name: "Robbie",
    username: "NumbrOne",
    id: 1
  };
  let goals: Goal[] = [];

  for (let i: number = 0; i < labels.length; i++)
    goals[i] = createBGoal(i, labels[i], tempUser);

  return {
    selectedIndex: 0,
    goalOptions: [...goals],
    mouseX: 0,
    lastIndex: 3
  };
}

// Creates a BaseGoal with the specified attributes
function createBGoal(id: number, name: string, user: User): Goal {
  let goal: Goal = new BaseGoal();
  goal.id = id;
  goal.name = name;
  goal.user = user;
  return goal;
}
