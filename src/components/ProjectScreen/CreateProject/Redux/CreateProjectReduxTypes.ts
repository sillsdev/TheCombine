export interface CreateProjectState {
  inProgress: boolean;
  success: boolean;
  errorMsg: string;
}

export const defaultState: CreateProjectState = {
  success: false,
  inProgress: false,
  errorMsg: "",
};
