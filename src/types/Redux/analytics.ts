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
  action: AnalyticsChangePageAction
): AnalyticsState => {
  switch (action.type) {
    case AnalyticsActionTypes.ChangePage:
      if (action.newPage !== state.currentPage) {
        analytics.track("navigate", {
          source: state.currentPage,
          destination: action.newPage,
        });
      }
      return {
        ...state,
        currentPage: action.newPage,
      };

    default:
      return state;
  }
};
