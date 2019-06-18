import * as actions from "../actions";
import { SortStyle } from "../DupSorter";

describe("Set sort style action test", () => {
  it("Should create the proper action", () => {
    let style: SortStyle = SortStyle.VERN_ASCENDING;
    expect(actions.changeSortStyle(style)).toEqual({
      type: actions.SORT_ACTION,
      payload: style
    });
  });
});
