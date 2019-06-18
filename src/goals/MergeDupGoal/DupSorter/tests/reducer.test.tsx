import * as reducer from "../reducer";
import { SortStyle } from "../DupSorter";
import { SortAction, SORT_ACTION, SortActionType } from "../actions";

const differentStyle: SortStyle = SortStyle.VERN_DESCENDING;
const descendingAction: SortAction = {
  type: SORT_ACTION,
  payload: differentStyle
};

describe("Set sort style action test", () => {
  it("Should return default state when called with undefined state", () => {
    expect(reducer.sortChangeReducer(undefined, descendingAction)).toEqual(
      reducer.defaultState
    );
  });

  it("Should return a state with a descending style", () => {
    let tempState: reducer.SortState = { ...reducer.defaultState };
    expect(reducer.sortChangeReducer(tempState, descendingAction)).toEqual({
      ...reducer.defaultState,
      sortStyle: differentStyle
    });
  });

  it("Should return same state when given a bad state", () => {
    let tempState: reducer.SortState = {
      ...reducer.defaultState,
      sortStyle: differentStyle
    };
    expect(
      reducer.sortChangeReducer(tempState, {
        type: ("" as any) as SortActionType,
        payload: SortStyle.VERN_ASCENDING
      })
    ).toEqual(tempState);
  });
});
