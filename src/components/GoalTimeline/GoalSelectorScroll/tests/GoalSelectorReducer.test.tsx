import { StoreActions, StoreAction } from "../../../../rootActions";
import { GoalSelectorState } from "../../../../types/goals";
import {
  GoalScrollAction,
  MOUSE_ACTION,
  SELECT_ACTION,
} from "../GoalSelectorAction";
import { defaultState, goalSelectReducer } from "../GoalSelectorReducer";

const VAL = 5;
const scrollAct: GoalScrollAction = {
  type: SELECT_ACTION,
  payload: VAL,
};
const scrollResultStore: GoalSelectorState = {
  ...defaultState,
  selectedIndex: VAL,
};
const mouseAct: GoalScrollAction = {
  type: MOUSE_ACTION,
  payload: VAL,
};
const mouseResultStore: GoalSelectorState = {
  ...defaultState,
  mouseX: VAL,
};

describe("Testing goal select reducer", () => {
  it("Should return defaultState", () => {
    expect(goalSelectReducer(undefined, scrollAct)).toEqual(defaultState);
  });

  it("Should return a state with an index of " + VAL, () => {
    expect(goalSelectReducer(defaultState, scrollAct)).toEqual(
      scrollResultStore
    );
  });

  it("Should return a state with an iX of " + VAL, () => {
    expect(goalSelectReducer(defaultState, mouseAct)).toEqual(mouseResultStore);
  });

  it("Should return the passed-in store", () => {
    expect(
      goalSelectReducer(scrollResultStore, ({
        type: "",
        payload: 0,
      } as unknown) as GoalScrollAction)
    ).toEqual(scrollResultStore);
  });

  it("Should return the default state", () => {
    const action: StoreAction = {
      type: StoreActions.RESET,
    };
    expect(goalSelectReducer(scrollResultStore, action)).toEqual(defaultState);
  });
});
