import {
  ResetAction,
  RESET_PASSWORD_ATTEMPT,
  RESET_PASSWORD_FAIL,
  RESET_PASSWORD_SUCCESS,
} from "components/PasswordReset/actions";
import { StoreAction } from "rootActions";

export enum RequestState {
  None,
  Attempt,
  Fail,
  Success,
}

export interface PasswordResetState {
  resetState: RequestState;
}

export const defaultState: PasswordResetState = {
  resetState: RequestState.None,
};

export const passwordResetReducer = (
  state: PasswordResetState = defaultState,
  action: StoreAction | ResetAction
): PasswordResetState => {
  switch (action.type) {
    case RESET_PASSWORD_ATTEMPT:
      return {
        resetState: RequestState.Attempt,
      };
    case RESET_PASSWORD_FAIL:
      return {
        resetState: RequestState.Fail,
      };
    case RESET_PASSWORD_SUCCESS:
      return {
        resetState: RequestState.Success,
      };
    default:
      return state;
  }
};
