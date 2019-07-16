import {
  UserAction,
  LOGIN_ATTEMPT,
  LOGIN_FAILURE,
  LOGIN_SUCCESS,
  LOGIN_RESET,
  REGISTER_FAILURE,
  REGISTER_ATTEMPT,
  REGISTER_SUCCESS,
  REGISTER_RESET,
  LOGOUT
} from "./LoginActions";
import { StoreAction, StoreActions } from "../../rootActions";

export interface LoginState {
  user: string;
  success: boolean;
  loginAttempt: boolean;
  loginFailure: boolean;
  registerAttempt: boolean;
  registerSuccess: boolean;
  registerFailure: boolean;
}

export const defaultState: LoginState = {
  user: "",
  success: false,
  loginAttempt: false,
  loginFailure: false,
  registerAttempt: false,
  registerSuccess: false,
  registerFailure: false
};

export const loginReducer = (
  state: LoginState = defaultState, //createStore() calls each reducer with undefined state
  action: StoreAction | UserAction
): LoginState => {
  switch (action.type) {
    case LOGIN_ATTEMPT:
      return {
        ...state,
        user: action.payload.user,
        success: false,
        loginAttempt: true,
        loginFailure: false
      };
    case LOGIN_FAILURE:
      return {
        ...state,
        user: action.payload.user,
        success: false,
        loginAttempt: false,
        loginFailure: true
      };
    case LOGIN_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
        success: true
      };
    case REGISTER_ATTEMPT:
      return {
        ...state,
        user: action.payload.user,
        registerAttempt: true,
        registerSuccess: false,
        registerFailure: false
      };
    case REGISTER_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
        registerAttempt: false,
        registerSuccess: true
      };
    case REGISTER_FAILURE:
      return {
        ...state,
        user: action.payload.user,
        registerAttempt: false,
        registerSuccess: false,
        registerFailure: true
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
