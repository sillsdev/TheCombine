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
  registerAttempt: false,
  registerFailure: "",
  registerSuccess: false,
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
    case LoginActionTypes.REGISTER_ATTEMPT:
      return {
        ...state,
        username: action.payload.username,
        registerAttempt: true,
        registerFailure: "",
        registerSuccess: false,
      };
    case LoginActionTypes.REGISTER_SUCCESS:
      return {
        ...state,
        username: action.payload.username,
        registerAttempt: false,
        registerSuccess: true,
      };
    case LoginActionTypes.REGISTER_FAILURE:
      return {
        ...state,
        registerAttempt: false,
        registerFailure: action.payload.username,
        registerSuccess: false,
      };
    case LoginActionTypes.LOGIN_RESET:
    case LoginActionTypes.LOGOUT:
    case StoreActionTypes.RESET:
    case LoginActionTypes.REGISTER_RESET:
      return defaultState;
    default:
      return state;
  }
};
