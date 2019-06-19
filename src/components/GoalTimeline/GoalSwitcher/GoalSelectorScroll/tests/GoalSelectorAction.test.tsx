import {
  SELECT_ACTION,
  ScrollSelectorAct,
  scrollSelectorIndexAction,
  scrollSelectorMouseAction,
  MouseMoveAct,
  MOUSE_ACTION
} from "../GoalSelectorAction";

const VAL = 5;

describe("Goal select action test", () => {
  it("Should create the correct select action", () => {
    var result: ScrollSelectorAct = {
      type: SELECT_ACTION,
      payload: VAL
    };

    expect(scrollSelectorIndexAction(VAL)).toEqual(result);
  });

  it("Should create the correct mouse action", () => {
    var result: MouseMoveAct = {
      type: MOUSE_ACTION,
      payload: VAL
    };

    expect(scrollSelectorMouseAction(VAL)).toEqual(result);
  });
});
