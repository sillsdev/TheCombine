import { resetPasswordRequest, resetPassword } from "backend";
import history, { Path } from "browserHistory";
import { StoreStateDispatch } from "types/actions";

export const RESET_PASSWORD_ATTEMPT = "RESET_PASSWORD_ATTEMPT";
export const RESET_PASSWORD_FAIL = "RESET_PASSWORD_FAIL";
export const RESET_PASSWORD_SUCCESS = "RESET_PASSWORD_SUCCESS";

type ResetActionType =
  | typeof RESET_PASSWORD_ATTEMPT
  | typeof RESET_PASSWORD_FAIL
  | typeof RESET_PASSWORD_SUCCESS;

export interface ResetAction {
  type: ResetActionType;
}

export function resetAttempt(): ResetAction {
  return {
    type: RESET_PASSWORD_ATTEMPT,
  };
}
export function resetFail(): ResetAction {
  return {
    type: RESET_PASSWORD_FAIL,
  };
}
export function resetSuccess(): ResetAction {
  return {
    type: RESET_PASSWORD_SUCCESS,
  };
}

export function asyncResetRequest(emailOrUsername: string) {
  return async (_dispatch: StoreStateDispatch) => {
    // make call
    await resetPasswordRequest(emailOrUsername);
  };
}

export function asyncReset(token: string, password: string) {
  return async (dispatch: StoreStateDispatch) => {
    dispatch(resetAttempt());
    // call reset
    const success = await resetPassword(token, password);
    if (success) {
      dispatch(resetSuccess());
      history.push(Path.Login);
    } else {
      dispatch(resetFail());
    }
  };
}
