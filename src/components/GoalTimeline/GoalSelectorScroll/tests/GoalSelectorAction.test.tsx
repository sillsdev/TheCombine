import {
  GoalScrollAction,
  MOUSE_ACTION,
  SELECT_ACTION,
  scrollSelectorIndexAction,
  scrollSelectorMouseAction,
} from "../GoalSelectorAction";

const VAL = 5;

describe("Goal select action test", () => {
  it("Should create the correct select action", () => {
    let result: GoalScrollAction = {
      type: SELECT_ACTION,
      payload: VAL,
    };
    expect(scrollSelectorIndexAction(VAL)).toEqual(result);
  });

  it("Should create the correct mouse action", () => {
    let result: GoalScrollAction = {
      type: MOUSE_ACTION,
      payload: VAL,
    };
    expect(scrollSelectorMouseAction(VAL)).toEqual(result);
  });
});
