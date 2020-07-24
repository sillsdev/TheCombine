import { StoreAction, StoreActions } from "../../rootActions";
import {
  LOGIN_ATTEMPT,
  LOGIN_FAILURE,
  LOGIN_RESET,
  LOGIN_SUCCESS,
  LOGOUT,
  REGISTER_ATTEMPT,
  REGISTER_FAILURE,
  REGISTER_RESET,
  REGISTER_SUCCESS,
  UserAction,
} from "./LoginActions";

export interface LoginState {
  username: string;
  success: boolean;
  loginAttempt: boolean;
  loginFailure: boolean;
  registerAttempt: boolean;
  registerSuccess: boolean;
  registerFailure: string;
}

export const defaultState: LoginState = {
  username: "",
  success: false,
  loginAttempt: false,
  loginFailure: false,
  registerAttempt: false,
  registerSuccess: false,
  registerFailure: "",
};

export const loginReducer = (
  state: LoginState = defaultState, //createStore() calls each reducer with undefined state
  action: StoreAction | UserAction
): LoginState => {
  switch (action.type) {
    case LOGIN_ATTEMPT:
      return {
        ...state,
        username: action.payload.username,
        success: false,
        loginAttempt: true,
        loginFailure: false,
      };
    case LOGIN_FAILURE:
      return {
        ...state,
        username: action.payload.username,
        success: false,
        loginAttempt: false,
        loginFailure: true,
      };
    case LOGIN_SUCCESS:
      return {
        ...state,
        username: action.payload.username,
        success: true,
      };
    case REGISTER_ATTEMPT:
      return {
        ...state,
        username: action.payload.username,
        registerAttempt: true,
        registerSuccess: false,
        registerFailure: "",
      };
    case REGISTER_SUCCESS:
      return {
        ...state,
        username: action.payload.username,
        registerAttempt: false,
        registerSuccess: true,
      };
    case REGISTER_FAILURE:
      return {
        ...state,
        registerAttempt: false,
        registerSuccess: false,
        registerFailure: action.payload.username,
      };
    case LOGIN_RESET:
    case LOGOUT:
    case StoreActions.RESET:
    case REGISTER_RESET:
      return defaultState;
    default:
      return state;
  }
};
