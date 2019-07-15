import dragWordReducer, { WordDragState, defaultState } from "../reducer";
import { StoreAction, StoreActions } from "../../../rootActions";

describe("DraggableWord reducer tests", () => {
  test("Reset returns default state", () => {
    const state: WordDragState = {
      draggedWord: {
        word: "What",
        sense: "Hey",
        duplicate: "Yeah"
      }
    };

    const action: StoreAction = {
      type: StoreActions.RESET
    };
    expect(dragWordReducer(state, action)).toEqual(defaultState);
  });
});
