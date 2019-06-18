import { Dispatch } from "react";
import axios from "axios";
//import axios from "./tests/__mocks__/axios";
import { history } from "../App/component";
import { authHeader } from "./AuthHeaders";
import { ThunkAction } from "redux-thunk";
import { AnyAction } from "redux";

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

export const REGISTER_FAILURE = "REGISTER_FAILURE";
export type REGISTER_FAILURE = typeof REGISTER_FAILURE;

export interface LoginData {
  user: string;
  password?: string;
}

type LoginType =
  | LOGIN_ATTEMPT
  | LOGIN_FAILURE
  | LOGIN_SUCCESS
  | REGISTER
  | REGISTER_FAILURE;

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
        "https://localhost:5001/v1/users/authenticate",
        JSON.stringify({ Username: user, Password: password }),
        { headers: { "content-type": "application/json", ...authHeader() } }
      )
      .then((res: any) => {
        console.log(res);
        localStorage.setItem("user", JSON.stringify(res.data)); //Store tokens
        dispatch(loginSuccess(user));
        history.push("/");
      })
      .catch(err => {
        console.log(err);
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
  return async (
    dispatch: Dispatch<UserAction | ThunkAction<any, {}, {}, AnyAction>>
  ) => {
    dispatch(register(user, password));
    // Create new user
    let newUser = {
      avatar: "",
      name: "",
      email: "",
      otherConnectionField: "",
      workedProjects: ["", ""],
      agreement: false,
      password: password,
      username: user,
      uiLang: "",
      token: ""
    };
    await axios
      .post("https://localhost:5001/v1/users", JSON.stringify(newUser), {
        headers: { ...authHeader(), "Content-Type": "application/json" }
      })
      .then(res => {
        //login
        dispatch(asyncLogin(user, password));
      })
      .catch(err => {
        console.log(err);
        dispatch(registerFailure(user));
      });
  };
}

//pure action creator. LEAVE PURE!
export function register(user: string, password: string): UserAction {
  return {
    type: REGISTER,
    payload: { user, password }
  };
}

export function registerFailure(user: string): UserAction {
  return {
    type: REGISTER_FAILURE,
    payload: { user }
  };
}
