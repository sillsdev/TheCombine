export interface AnalyticsState {
  consent: boolean;
  currentPage: string;
}

export const defaultState: AnalyticsState = {
  consent: false,
  currentPage: "",
};
