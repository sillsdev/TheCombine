import { resetPasswordRequest, resetPassword } from "backend";
import history, { Path } from "browserHistory";
import { StoreStateDispatch } from "types/actions";
import {
  ResetAction,
  ResetActions,
} from "components/PasswordReset/Redux/ResetActionTypes";

export function resetAttempt(): ResetAction {
  return {
    type: ResetActions.RESET_PASSWORD_ATTEMPT,
  };
}
export function resetFail(): ResetAction {
  return {
    type: ResetActions.RESET_PASSWORD_FAIL,
  };
}
export function resetSuccess(): ResetAction {
  return {
    type: ResetActions.RESET_PASSWORD_SUCCESS,
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
