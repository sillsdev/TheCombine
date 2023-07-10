import {
  LoginActionTypes,
  LoginState,
  UserAction,
} from "components/Login/Redux/LoginReduxTypes";
import { StoreAction, StoreActionTypes } from "rootActions";

export const defaultState: LoginState = {
  username: "",
  loginAttempt: false,
  loginFailure: false,
  loginSuccess: false,
  signUpAttempt: false,
  signUpFailure: "",
  signUpSuccess: false,
};

export const loginReducer = (
  state: LoginState = defaultState, //createStore() calls each reducer with undefined state
  action: StoreAction | UserAction
): LoginState => {
  switch (action.type) {
    case LoginActionTypes.LOGIN_ATTEMPT:
      return {
        ...state,
        username: action.payload.username,
        loginAttempt: true,
        loginSuccess: false,
        loginFailure: false,
      };
    case LoginActionTypes.LOGIN_FAILURE:
      return {
        ...state,
        username: action.payload.username,
        loginAttempt: false,
        loginFailure: true,
        loginSuccess: false,
      };
    case LoginActionTypes.LOGIN_SUCCESS:
      return {
        ...state,
        username: action.payload.username,
        loginSuccess: true,
      };
    case LoginActionTypes.SIGN_UP_ATTEMPT:
      return {
        ...state,
        username: action.payload.username,
        signUpAttempt: true,
        signUpFailure: "",
        signUpSuccess: false,
      };
    case LoginActionTypes.SIGN_UP_SUCCESS:
      return {
        ...state,
        username: action.payload.username,
        signUpAttempt: false,
        signUpSuccess: true,
      };
    case LoginActionTypes.SIGN_UP_FAILURE:
      return {
        ...state,
        signUpAttempt: false,
        signUpFailure: action.payload.username,
        signUpSuccess: false,
      };
    case StoreActionTypes.RESET:
      return defaultState;
    default:
      return state;
  }
};
