import {
  LOGIN,
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
    case LOGIN:
      console.log("LOGIN METHOD");
      return { user: action.payload.user, success: true };
    case LOGIN_ATTEMPT:
      console.log("Attempting to log in...");
      return { user: action.payload.user, success: false, loginAttempt: true };
    case LOGIN_FAILURE:
      console.log("Failed to log in");
      return { user: action.payload.user, success: false };
    case LOGIN_SUCCESS:
      console.log("Successfully logged in");
      return { user: action.payload.user, success: true };
    case REGISTER:
      console.log("REGISTER METHOD");
      return { user: action.payload.user, success: true };
    default:
      return state;
  }
};
