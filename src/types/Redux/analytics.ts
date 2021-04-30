import { StoreAction, StoreActionTypes } from "rootActions";
import {
  AnalyticsActionTypes,
  AnalyticsChangePageAction,
  AnalyticsState,
  defaultState,
} from "types/Redux/analyticsReduxTypes";

export function changePage(newPage: string): AnalyticsChangePageAction {
  return {
    type: AnalyticsActionTypes.ChangePage,
    newPage,
  };
}

export const analyticsReducer = (
  //createStore() calls each reducer with undefined state
  state: AnalyticsState = defaultState,
  action: AnalyticsChangePageAction | StoreAction
): AnalyticsState => {
  switch (action.type) {
    case AnalyticsActionTypes.ChangePage:
      return {
        ...state,
        currentPage: action.newPage,
      };

    case StoreActionTypes.RESET:
      return defaultState;

    default:
      return state;
  }
};
