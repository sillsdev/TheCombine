import { resetPasswordRequest, resetPassword } from "backend";
import history, { Path } from "browserHistory";
import {
  ResetAction,
  ResetActionTypes,
} from "components/PasswordReset/Redux/ResetReduxTypes";
import { StoreStateDispatch } from "types/Redux/actions";

export function resetAttempt(): ResetAction {
  return {
    type: ResetActionTypes.RESET_PASSWORD_ATTEMPT,
  };
}
export function resetFail(): ResetAction {
  return {
    type: ResetActionTypes.RESET_PASSWORD_FAIL,
  };
}
export function resetSuccess(): ResetAction {
  return {
    type: ResetActionTypes.RESET_PASSWORD_SUCCESS,
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
