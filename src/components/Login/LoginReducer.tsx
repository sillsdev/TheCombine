import {
  UserAction,
  REGISTER,
  LOGIN_ATTEMPT,
  LOGIN_FAILURE,
  LOGIN_SUCCESS,
  REGISTER_FAILURE
} from "./LoginActions";

export interface LoginState {
  user: string;
  success: boolean;
  loginAttempt?: boolean;
  loginFailure?: boolean;
  registerFailure?: boolean;
}

export const defaultState: LoginState = {
  user: "",
  success: false
};

export const loginReducer = (
  state: LoginState | undefined, //createStore() calls each reducer with undefined state
  action: UserAction
): LoginState => {
  if (!state) return defaultState;
  switch (action.type) {
    case LOGIN_ATTEMPT:
      return {
        user: action.payload.user,
        success: false,
        loginAttempt: true,
        loginFailure: false
      };
    case LOGIN_FAILURE:
      return {
        user: action.payload.user,
        success: false,
        loginAttempt: false,
        loginFailure: true
      };
    case LOGIN_SUCCESS:
      return { user: action.payload.user, success: true };
    case REGISTER:
      return {
        user: action.payload.user,
        success: true,
        registerFailure: false
      };
    case REGISTER_FAILURE:
      return {
        user: action.payload.user,
        success: false,
        registerFailure: true
      };
    default:
      return state;
  }
};
