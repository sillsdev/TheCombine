import { Dispatch } from "react";
//import axios from "./tests/__mocks__/axios";
import history from "../../history";
import { ThunkAction } from "redux-thunk";
import { AnyAction } from "redux";
import * as backend from "../../backend";
import { User } from "../../types/user";

export const LOGIN_ATTEMPT = "LOGIN_ATTEMPT";
export type LOGIN_ATTEMPT = typeof LOGIN_ATTEMPT;

export const LOGIN_FAILURE = "LOGIN_FAILURE";
export type LOGIN_FAILURE = typeof LOGIN_FAILURE;

export const LOGIN_SUCCESS = "LOGIN_SUCCESS";
export type LOGIN_SUCCESS = typeof LOGIN_SUCCESS;

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

type LoginType =
  | LOGIN_ATTEMPT
  | LOGIN_FAILURE
  | LOGIN_SUCCESS
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
    console.log("Login attempt succeeded");
    //attempt to login with server
    await backend
      .authenticateUser(user, password)
      .then((res: any) => {
        try {
          console.log("Authenticate succeeded");
          localStorage.setItem("user", res); //Store tokens
          console.log("local storage succeeded");
          dispatch(loginSuccess(user));
          console.log("Login success succeeded");
          history.push("/");
          console.log("History succeeded");
        } catch (err) {
          console.log(err);
        }
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

export function logout() {
  return () => {
    localStorage.removeItem("user");
  };
}

export function asyncRegister(name: string, user: string, password: string) {
  return async (
    dispatch: Dispatch<UserAction | ThunkAction<any, {}, {}, AnyAction>>
  ) => {
    dispatch(registerAttempt(user));
    // Create new user
    let newUser = new User("", user, password);
    newUser.name = name;
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
        dispatch(registerFailure(user));
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

export function registerFailure(user: string): UserAction {
  return {
    type: REGISTER_FAILURE,
    payload: { user }
  };
}

export function registerReset(): UserAction {
  return {
    type: REGISTER_RESET,
    payload: { user: "" }
  };
}
