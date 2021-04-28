export enum ResetActionTypes {
  RESET_PASSWORD_ATTEMPT = "RESET_PASSWORD_ATTEMPT",
  RESET_PASSWORD_FAIL = "RESET_PASSWORD_FAIL",
  RESET_PASSWORD_SUCCESS = "RESET_PASSWORD_SUCCESS",
}

export type ResetActionType =
  | typeof ResetActionTypes.RESET_PASSWORD_ATTEMPT
  | typeof ResetActionTypes.RESET_PASSWORD_FAIL
  | typeof ResetActionTypes.RESET_PASSWORD_SUCCESS;

export interface ResetAction {
  type: ResetActionType;
}

export enum RequestState {
  None,
  Attempt,
  Fail,
  Success,
}

export interface PasswordResetState {
  resetState: RequestState;
}
