import { SortAction, SORT_ACTION } from "./actions";
import { SortStyle } from "./DupSorter";

export interface SortState {
  sortStyle?: SortStyle;
}

export const defaultState: SortState = {
  sortStyle: SortStyle.VERN_ASCENDING
};

export const sortChangeReducer = (
  state: SortState | undefined,
  action: SortAction
): SortState => {
  if (!state) return defaultState;
  switch (action.type) {
    case SORT_ACTION:
      return {
        ...state,
        sortStyle: action.payload
      };

    default:
      return state;
  }
};
