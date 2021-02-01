import { StoreAction, StoreActions } from "rootActions";
import * as LoginAction from "components/Login/LoginActions";

export interface LoginState {
  username: string;
  loginAttempt: boolean;
  loginFailure: boolean;
  loginSuccess: boolean;
  registerAttempt: boolean;
  registerFailure: string;
  registerSuccess: boolean;
}

export const defaultState: LoginState = {
  username: "",
  loginAttempt: false,
  loginFailure: false,
  loginSuccess: false,
  registerAttempt: false,
  registerFailure: "",
  registerSuccess: false,
};

export const loginReducer = (
  state: LoginState = defaultState, //createStore() calls each reducer with undefined state
  action: StoreAction | LoginAction.UserAction
): LoginState => {
  switch (action.type) {
    case LoginAction.LOGIN_ATTEMPT:
      return {
        ...state,
        username: action.payload.username,
        loginAttempt: true,
        loginSuccess: false,
        loginFailure: false,
      };
    case LoginAction.LOGIN_FAILURE:
      return {
        ...state,
        username: action.payload.username,
        loginAttempt: false,
        loginFailure: true,
        loginSuccess: false,
      };
    case LoginAction.LOGIN_SUCCESS:
      return {
        ...state,
        username: action.payload.username,
        loginSuccess: true,
      };
    case LoginAction.REGISTER_ATTEMPT:
      return {
        ...state,
        username: action.payload.username,
        registerAttempt: true,
        registerFailure: "",
        registerSuccess: false,
      };
    case LoginAction.REGISTER_SUCCESS:
      return {
        ...state,
        username: action.payload.username,
        registerAttempt: false,
        registerSuccess: true,
      };
    case LoginAction.REGISTER_FAILURE:
      return {
        ...state,
        registerAttempt: false,
        registerFailure: action.payload.username,
        registerSuccess: false,
      };
    case LoginAction.LOGIN_RESET:
      return defaultState;
    case LoginAction.LOGOUT:
      return defaultState;
    case StoreActions.RESET:
      return defaultState;
    case LoginAction.REGISTER_RESET:
      return defaultState;
    default:
      return state;
  }
};
