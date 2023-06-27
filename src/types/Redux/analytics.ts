import {
  AnalyticsActionTypes,
  AnalyticsChangePageAction,
  AnalyticsState,
  defaultState,
} from "types/Redux/analyticsReduxTypes";

export function changePage(newPage: string): AnalyticsChangePageAction {
  console.log(`changePage(${newPage})`);
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
      console.log(`analytics action: changePage(${action.newPage})`);
      return {
        ...state,
        currentPage: action.newPage,
      };

    default:
      return state;
  }
};
