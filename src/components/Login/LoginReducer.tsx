import {
  UserAction,
  REGISTER,
  LOGIN_ATTEMPT,
  LOGIN_FAILURE,
  LOGIN_SUCCESS
} from "./LoginActions";

export interface LoginState {
  user: string;
  success: boolean;
  loginAttempt?: boolean;
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
      return { user: action.payload.user, success: false, loginAttempt: true };
    case LOGIN_FAILURE:
      return { user: action.payload.user, success: false };
    case LOGIN_SUCCESS:
      return { user: action.payload.user, success: true };
    case REGISTER:
      return { user: action.payload.user, success: true };
    default:
      return state;
  }
};
