import {
  ResetAction,
  RESET_PASSWORD_ATTEMPT,
  RESET_PASSWORD_FAIL,
  RESET_PASSWORD_SUCCESS,
} from "./actions";
import { StoreAction } from "../../rootActions";

export interface PasswordResetState {
  resetAttempt: boolean;
  resetFailure: boolean;
  resetSuccess: boolean;
}

export const defaultState: PasswordResetState = {
  resetAttempt: false,
  resetFailure: false,
  resetSuccess: false,
};

export const passwordResetReducer = (
  state: PasswordResetState = defaultState,
  action: StoreAction | ResetAction
): PasswordResetState => {
  switch (action.type) {
    case RESET_PASSWORD_ATTEMPT:
      return {
        resetAttempt: true,
        resetFailure: false,
        resetSuccess: false,
      };
    case RESET_PASSWORD_FAIL:
      return {
        resetAttempt: false,
        resetFailure: true,
        resetSuccess: false,
      };
    case RESET_PASSWORD_SUCCESS:
      return {
        resetAttempt: false,
        resetFailure: false,
        resetSuccess: true,
      };
    default:
      return state;
  }
};
