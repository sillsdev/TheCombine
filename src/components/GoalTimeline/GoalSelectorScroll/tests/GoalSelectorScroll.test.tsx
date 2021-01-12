import React from "react";
import { Provider } from "react-redux";
import renderer, {
  ReactTestInstance,
  ReactTestRenderer,
} from "react-test-renderer";
import configureMockStore from "redux-mock-store";
import thunk from "redux-thunk";

import { Goal, GoalName, GoalSelectorState } from "../../../../types/goals";
import { User } from "../../../../types/user";
import GoalSelectorScroll from "../";
import {
  GoalScrollAction,
  MOUSE_ACTION,
  SELECT_ACTION,
} from "../GoalSelectorAction";
import {
  GoalSelectorScroll as GSScroll,
  percentToPixels,
  WIDTH,
  WRAP_AROUND_THRESHHOLD,
} from "../GoalSelectorScroll";

const labels = [
  GoalName.CreateStrWordInv,
  GoalName.HandleFlags,
  GoalName.SpellcheckGloss,
];

// Create the mock store
const gsState: GoalSelectorState = createTempState();
const storeState: any = {
  innerWidth: 500,
  goalSelectorState: gsState,
  goalsState: {
    allPossibleGoals: gsState.allPossibleGoals,
  },
};
const createMockStore = configureMockStore([thunk]);
const store = createMockStore(storeState);

// Mock the DOM
jest.autoMockOn();

// Bypass getScroll relying on refs, which fail in jest testing
var scroller: any = {
  scrollLeft: WRAP_AROUND_THRESHHOLD,
};
GSScroll.prototype.getScroll = jest.fn(() => {
  return scroller as HTMLElement;
});

// TODO: Should this lint be disabled?
// eslint-disable-next-line no-native-reassign
window = {
  ...window,
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
};

// Variables used in testing: contain various parts of the UI
var scrollMaster: ReactTestRenderer;
var scrollHandle: ReactTestInstance;

// Action constants
const select: GoalScrollAction = {
  type: SELECT_ACTION,
  payload: 0,
};
const mouse: GoalScrollAction = {
  type: MOUSE_ACTION,
  payload: 0,
};

beforeEach(() => {
  // Here, use the act block to be able to render our GoalState into the DOM
  // Re-created each time to prevent actions from previous runs from affecting future runs
  renderer.act(() => {
    scrollMaster = renderer.create(
      <Provider store={store}>
        <GoalSelectorScroll handleChange={jest.fn()} />
      </Provider>
    );
  });
  scrollHandle = scrollMaster.root.findByType(GSScroll);
  scroller.scrollLeft = percentToPixels(WRAP_AROUND_THRESHHOLD);

  // Reset store actions
  store.clearActions();
});

// Actual tests
describe("Testing the goal selector scroll ui", () => {
  test("Basic functions work as expected", () => {
    expect(percentToPixels(10)).toEqual(window.innerWidth * 0.1);
  });

  it("Constructs correctly", () => {
    // Default snapshot test
    snapTest("default view");
  });

  it("Dispatches ndx to store on navigate left", () => {
    let action: GoalScrollAction = {
      type: SELECT_ACTION,
      payload: 2,
    };
    scrollHandle.instance.scrollLeft();
    expect(store.getActions()).toEqual([action]);
  });

  it("Dispatches a ScrollSelectorAct to store on navigate right", () => {
    scrollHandle.instance.scrollRight();
    expect(store.getActions()).toEqual([
      {
        type: SELECT_ACTION,
        payload: 1,
      },
    ]);
  });

  it("Dispatches a MouseMoveAct to the store on scrollStart", () => {
    scrollHandle.instance.scrollStart({
      screenX: mouse.payload,
    });
    expect(store.getActions()).toEqual([mouse]);

    // Remove extra listeners
    scrollHandle.instance.scrollEnd({
      screenX: 0,
    });
  });

  it("Dispatches a MouseMoveAct on scrollDur-short stroke", () => {
    let shortStroke: GoalScrollAction = {
      type: MOUSE_ACTION,
      payload: -1,
    };
    scrollHandle.instance.scrollDur({
      screenX: shortStroke.payload,
    });
    expect(store.getActions()).toEqual([shortStroke]);
  });

  it("Dispatches a MouseMoveAct and a ScrollSelectorAct on scrollDur-long stroke", () => {
    let newMouse: GoalScrollAction = {
      type: MOUSE_ACTION,
      payload: -percentToPixels(WIDTH),
    };
    let newSelect: GoalScrollAction = {
      type: SELECT_ACTION,
      payload: 1,
    };
    scrollHandle.instance.scrollDur({
      screenX: newMouse.payload,
    });
    expect(store.getActions()).toEqual([newMouse, newSelect]);
  });

  it("Dispatches a MouseMoveAct 1 out of every 2 times scrollDur is called", () => {
    let shortStroke: GoalScrollAction = {
      type: MOUSE_ACTION,
      payload: -1,
    };
    for (let i: number = 0; i < 4; i++)
      scrollHandle.instance.scrollDur({
        screenX: shortStroke.payload,
      });
    expect(store.getActions()).toEqual([shortStroke, shortStroke]);
  });

  it("Dispatches a ScrollSelectorAct on scrollEnd", () => {
    scrollHandle.instance.scrollEnd({
      screenX: mouse.payload,
    });
    expect(store.getActions()).toEqual([select]);
  });

  it("Calls handleChange on click to the active card", () => {
    scrollHandle.instance.cardHandleClick(
      {
        type: "click",
      },
      gsState.selectedIndex
    );
    expect(scrollHandle.instance.props.handleChange).toHaveBeenCalledWith(
      gsState.allPossibleGoals[gsState.selectedIndex].name
    );
  });

  it("Swaps index on click to a non-active card", () => {
    scrollHandle.instance.cardHandleClick(
      {
        type: "click",
      },
      gsState.selectedIndex + 1
    );
    expect(store.getActions()).toEqual([
      {
        type: SELECT_ACTION,
        payload: gsState.selectedIndex + 1,
      },
    ]);
  });
});

// Utility functions ----------------------------------------------------------------

// Perform a snapshot test
function snapTest(name: string) {
  expect(scrollMaster.toJSON()).toMatchSnapshot();
}

// Create a usable temporary state, as opposed to a dummy state
function createTempState(): GoalSelectorState {
  let tempUser: User = new User("Robbie", "NumberOne", "password");
  let goals: Goal[] = [];

  for (let i: number = 0; i < labels.length; i++)
    goals[i] = createGoal(labels[i], tempUser);

  return {
    selectedIndex: 0,
    allPossibleGoals: [...goals],
    mouseX: 0,
    lastIndex: 3,
  };
}

// Creates a Goal with the specified attributes
function createGoal(name: GoalName, user: User): Goal {
  const goal: Goal = new Goal();
  goal.name = name;
  goal.user = user;
  return goal;
}
