import { LOGIN, UserAction, REGISTER } from "./LoginActions";

export interface LoginState {
  user: String;
  success: boolean;
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
    case REGISTER:
      console.log("REGISTER METHOD");
      return { user: action.payload.user, success: true };
    default:
      return state;
  }
};
