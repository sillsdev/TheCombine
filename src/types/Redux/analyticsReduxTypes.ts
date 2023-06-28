export interface AnalyticsState {
  currentPage: string;
}

export const defaultState: AnalyticsState = {
  currentPage: "",
};

export enum AnalyticsActionTypes {
  ChangePage = "CHANGE_CURRENT_PAGE",
}

export interface AnalyticsChangePageAction {
  type: AnalyticsActionTypes.ChangePage;
  newPage: string;
}
