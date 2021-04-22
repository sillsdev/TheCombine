import { StoreAction, StoreActions } from "rootActions";

export interface AnalyticsState {
  currentPage: string;
}

export const defaultState: AnalyticsState = {
  currentPage: "",
};

export enum AnalyticsActionTypes {
  ChangePage = "CHANGE_CURRENT_PAGE",
}

interface AnalyticsChangePageAction {
  type: AnalyticsActionTypes.ChangePage;
  newPage: string;
}

export function changePage(newPage: string): AnalyticsChangePageAction {
  return {
    type: AnalyticsActionTypes.ChangePage,
    newPage,
  };
}

export const analyticsReducer = (
  state: AnalyticsState = defaultState, //createStore() calls each reducer with undefined state
  action: AnalyticsChangePageAction | StoreAction
): AnalyticsState => {
  switch (action.type) {
    case AnalyticsActionTypes.ChangePage:
      // Update the local words
      return {
        ...state,
        currentPage: action.newPage,
      };

    case StoreActions.RESET:
      return defaultState;

    default:
      return state;
  }
};
