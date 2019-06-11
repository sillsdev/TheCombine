import { Dispatch } from "react";
import axios from "axios";
//import axios from "./tests/__mocks__/axios";
import { history } from "../App/App";
import { authHeader } from "./AuthHeaders";
import { getTranslate } from "react-localize-redux";

export const LOGIN_ATTEMPT = "LOGIN_ATTEMPT";
export type LOGIN_ATTEMPT = typeof LOGIN_ATTEMPT;

export const LOGIN_FAILURE = "LOGIN_FAILURE";
export type LOGIN_FAILURE = typeof LOGIN_FAILURE;

export const LOGIN_SUCCESS = "LOGIN_SUCCESS";
export type LOGIN_SUCCESS = typeof LOGIN_SUCCESS;

export const LOGOUT = "LOGOUT";
export type LOGOUT = typeof LOGOUT;

export const REGISTER = "REGISTER";
export type REGISTER = typeof REGISTER;

export interface LoginData {
  user: string;
  password?: string;
}

type LoginType = LOGIN_ATTEMPT | LOGIN_FAILURE | LOGIN_SUCCESS | REGISTER;

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
    await axios
      .post(
        "https://localhost:5001/v1/login",
        JSON.stringify({ user, password }),
        { headers: authHeader() }
      )
      .then((res: any) => {
        console.log(res);
        localStorage.setItem("user", JSON.stringify(res.data)); //Store tokens
        dispatch(loginSuccess(user));
        history.push("/");
      })
      .catch(err => {
        console.log(err);
        alert(getTranslate(getState().localize)("login.failed")); // TODO alerts should probably be implemented with a material-ui element
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

export function asyncRegister(user: string, password: string) {
  return async (dispatch: Dispatch<UserAction>) => {
    dispatch(register(user, password));
  };
}

//pure action creator. LEAVE PURE!
export function register(user: string, password: string): UserAction {
  return {
    type: REGISTER,
    payload: { user, password }
  };
}
