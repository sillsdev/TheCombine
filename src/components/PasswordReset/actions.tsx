import { Dispatch } from "react";
import history from "../../history";
import { ThunkAction } from "redux-thunk";
import { AnyAction } from "redux";
import { resetPasswordRequest, resetPassword } from "../../backend";

export const RESET_PASSWORD_ATTEMPT = "RESET_PASSWORD_ATTEMPT";
export type RESET_PASSWORD_ATTEMPT = typeof RESET_PASSWORD_ATTEMPT;

export const RESET_PASSWORD_SUCCESS = "RESET_PASSWORD_SUCCESS";
export type RESET_PASSWORD_SUCCESS = typeof RESET_PASSWORD_SUCCESS;

export const RESET_PASSWORD_FAIL = "RESET_PASSWORD_FAIL";
export type RESET_PASSWORD_FAIL = typeof RESET_PASSWORD_FAIL;

export interface ResetAction {
  type: RESET_PASSWORD_ATTEMPT | RESET_PASSWORD_FAIL | RESET_PASSWORD_SUCCESS;
}

export function resetAttempt(): ResetAction {
  return {
    type: RESET_PASSWORD_ATTEMPT,
  };
}

export function resetSuccess(): ResetAction {
  return {
    type: RESET_PASSWORD_SUCCESS,
  };
}

export function resetFail(): ResetAction {
  return {
    type: RESET_PASSWORD_FAIL,
  };
}

export function asyncResetRequest(email: string){
  return async (
    dispatch: Dispatch<ResetAction | ThunkAction<any, {}, {}, AnyAction>>
  ) => {
    // make call
    await resetPasswordRequest(email);
    history.push("/forgot/reset");
  }
}

export function asyncReset(email: string, token: string, password: string) {
  return async (
    dispatch: Dispatch<ResetAction | ThunkAction<any, {}, {}, AnyAction>>
  ) => {
    dispatch(resetAttempt());
    // call reset
    let success = await resetPassword(email, token, password);
    if (success) {
      dispatch(resetSuccess());
      history.push("/login");
    }else{
    dispatch(resetFail());
    }
  };
}
