import { goalSelectReducer, defaultState } from "../GoalSelectorReducer";
import {
  SELECT_ACTION,
  ScrollAction,
  MOUSE_ACTION
} from "../GoalSelectorAction";
import { GoalSelectorState } from "../../../../../types/goals";

const VAL = 5;
const scrollAct: ScrollAction = {
  type: SELECT_ACTION,
  payload: VAL
};
const scrollResultStore: GoalSelectorState = {
  ndx: VAL,
  goalOptions: [],
  iX: 0,
  end: 0
};
const mouseAct: ScrollAction = {
  type: MOUSE_ACTION,
  payload: VAL
};
const mouseResultStore: GoalSelectorState = {
  ndx: 0,
  goalOptions: [],
  iX: VAL,
  end: 0
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
        payload: 0
      } as unknown) as ScrollAction)
    ).toEqual(scrollResultStore);
  });
});
