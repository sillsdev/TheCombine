import {
  PasswordResetState,
  RequestState,
  ResetAction,
  ResetActionTypes,
} from "components/PasswordReset/Redux/ResetReduxTypes";
import { StoreAction } from "rootActions";

export const defaultState: PasswordResetState = {
  resetState: RequestState.None,
};

export const passwordResetReducer = (
  state: PasswordResetState = defaultState,
  action: StoreAction | ResetAction
): PasswordResetState => {
  switch (action.type) {
    case ResetActionTypes.RESET_PASSWORD_ATTEMPT:
      return {
        resetState: RequestState.Attempt,
      };
    case ResetActionTypes.RESET_PASSWORD_FAIL:
      return {
        resetState: RequestState.Fail,
      };
    case ResetActionTypes.RESET_PASSWORD_SUCCESS:
      return {
        resetState: RequestState.Success,
      };
    default:
      return state;
  }
};
