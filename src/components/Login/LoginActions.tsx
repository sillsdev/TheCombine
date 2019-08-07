import { Dispatch } from "react";
import history from "../../history";
import { ThunkAction } from "redux-thunk";
import { AnyAction } from "redux";
import * as backend from "../../backend";
import { User } from "../../types/user";
import { StoreAction, reset } from "../../rootActions";

export const LOGIN_ATTEMPT = "LOGIN_ATTEMPT";
export type LOGIN_ATTEMPT = typeof LOGIN_ATTEMPT;

export const LOGIN_FAILURE = "LOGIN_FAILURE";
export type LOGIN_FAILURE = typeof LOGIN_FAILURE;

export const LOGIN_SUCCESS = "LOGIN_SUCCESS";
export type LOGIN_SUCCESS = typeof LOGIN_SUCCESS;

export const LOGIN_RESET = "LOGIN_RESET";
export type LOGIN_RESET = typeof LOGIN_RESET;

export const LOGOUT = "LOGOUT";
export type LOGOUT = typeof LOGOUT;

export const REGISTER_ATTEMPT = "REGISTER_ATTEMPT";
export type REGISTER_ATTEMPT = typeof REGISTER_ATTEMPT;

export const REGISTER_SUCCESS = "REGISTER_SUCCESS";
export type REGISTER_SUCCESS = typeof REGISTER_SUCCESS;

export const REGISTER_FAILURE = "REGISTER_FAILURE";
export type REGISTER_FAILURE = typeof REGISTER_FAILURE;

export const REGISTER_RESET = "REGISTER_RESET";
export type REGISTER_RESET = typeof REGISTER_RESET;

export interface LoginData {
  user: string;
  password?: string;
}

export type LoginType =
  | LOGIN_ATTEMPT
  | LOGIN_FAILURE
  | LOGIN_SUCCESS
  | LOGIN_RESET
  | LOGOUT
  | REGISTER_ATTEMPT
  | REGISTER_SUCCESS
  | REGISTER_FAILURE
  | REGISTER_RESET;

//action types

export interface UserAction {
  type: LoginType;
  payload: LoginData;
}

//thunk action creator
export function asyncLogin(user: string, password: string) {
  return async (dispatch: Dispatch<UserAction>, getState: any) => {
    dispatch(loginAttempt(user));
    //attempt to login with server
    await backend
      .authenticateUser(user, password)
      .then((res: string) => {
        localStorage.setItem("user", res); //Store tokens
        dispatch(loginSuccess(user));
        history.push("/");
      })
      .catch(err => {
        dispatch(loginFailure(user));
      });
  };
}

export function loginAttempt(user: string): UserAction {
  return {
    type: LOGIN_ATTEMPT,
    payload: { user }
  };
}

export function loginFailure(user: string): UserAction {
  return {
    type: LOGIN_FAILURE,
    payload: { user }
  };
}

export function loginSuccess(user: string): UserAction {
  return {
    type: LOGIN_SUCCESS,
    payload: { user }
  };
}

export function loginReset(): UserAction {
  return {
    type: LOGIN_RESET,
    payload: { user: "" }
  };
}

export function logoutAndResetStore() {
  return (dispatch: Dispatch<UserAction | StoreAction>) => {
    const user = localStorage.getItem("user");
    if (user) {
      dispatch(logout(user));
    }
    dispatch(reset());
    localStorage.removeItem("user");
  };
}

export function asyncRegister(
  name: string,
  user: string,
  email: string,
  password: string
) {
  return async (
    dispatch: Dispatch<UserAction | ThunkAction<any, {}, {}, AnyAction>>
  ) => {
    dispatch(registerAttempt(user));
    // Create new user
    let newUser = new User(name, user, password);
    newUser.email = email;
    await backend
      .addUser(newUser)
      .then(res => {
        dispatch(registerSuccess(user));
        setTimeout(() => {
          dispatch(registerReset());
          history.push("/login");
        }, 1000);
      })
      .catch(err => {
        dispatch(
          registerFailure((err.response && err.response.status) || err.message)
        );
      });
  };
}
export function registerAttempt(user: string): UserAction {
  return {
    type: REGISTER_ATTEMPT,
    payload: { user }
  };
}

export function registerSuccess(user: string): UserAction {
  return {
    type: REGISTER_SUCCESS,
    payload: { user }
  };
}

export function registerFailure(errorMessage: string): UserAction {
  return {
    type: REGISTER_FAILURE,
    payload: { user: errorMessage }
  };
}

export function registerReset(): UserAction {
  return {
    type: REGISTER_RESET,
    payload: { user: "" }
  };
}

function logout(user: string): UserAction {
  return {
    type: LOGOUT,
    payload: { user: user }
  };
}
