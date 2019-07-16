import dragWordReducer, { WordDragState, defaultState } from "../reducer";
import { StoreAction, StoreActions } from "../../../rootActions";

describe("DraggableWord reducer tests", () => {
  test("Reset returns default state", () => {
    const action: StoreAction = {
      type: StoreActions.RESET
    };
    expect(dragWordReducer({} as WordDragState, action)).toEqual(defaultState);
  });
});
