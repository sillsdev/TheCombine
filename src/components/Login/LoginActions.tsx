import { Dispatch } from "react";
import { ThunkAction } from "redux-thunk";
import { AnyAction } from "redux";

import * as backend from "../../backend";
import history from "../../history";
import { StoreAction, reset } from "../../rootActions";
import { User } from "../../types/user";

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
  username: string;
  password?: string;
}

export type LoginType =
  | LOGIN_ATTEMPT
  | LOGIN_FAILURE
  | LOGIN_SUCCESS
  | LOGIN_RESET
  | REGISTER_ATTEMPT
  | REGISTER_FAILURE
  | REGISTER_SUCCESS
  | REGISTER_RESET
  | LOGOUT;

//action types

export interface UserAction {
  type: LoginType;
  payload: LoginData;
}

//thunk action creator
export function asyncLogin(username: string, password: string) {
  return async (dispatch: Dispatch<UserAction>, getState: any) => {
    dispatch(loginAttempt(username));
    await backend
      .authenticateUser(username, password)
      .then(async (userString: string) => {
        await localStorage.setItem("user", userString); //Store tokens'
        dispatch(loginSuccess(username));
        const currentUser = backend.getCurrentUser();
        if (currentUser) {
          try {
            var avatar = await backend.avatarSrc(currentUser!);
            backend.setAvatar(avatar);
          } catch (e) {
            backend.setAvatar("");
          }
        }
        history.push("/");
      })
      .catch((err) => {
        dispatch(loginFailure(username));
      });
  };
}

export function loginAttempt(username: string): UserAction {
  return {
    type: LOGIN_ATTEMPT,
    payload: { username },
  };
}

export function loginFailure(username: string): UserAction {
  return {
    type: LOGIN_FAILURE,
    payload: { username },
  };
}

export function loginSuccess(username: string): UserAction {
  return {
    type: LOGIN_SUCCESS,
    payload: { username },
  };
}

export function loginReset(): UserAction {
  return {
    type: LOGIN_RESET,
    payload: { username: "" },
  };
}

export function logoutAndResetStore() {
  return (dispatch: Dispatch<UserAction | StoreAction>) => {
    const userString: string | null = localStorage.getItem("user");
    if (userString) {
      const user: User = JSON.parse(userString);
      dispatch(logout(user.username));
    }
    dispatch(reset());
    localStorage.removeItem("user");
  };
}

export function asyncRegister(
  name: string,
  username: string,
  email: string,
  password: string
) {
  return async (
    dispatch: Dispatch<UserAction | ThunkAction<any, {}, {}, AnyAction>>
  ) => {
    dispatch(registerAttempt(username));
    // Create new user
    let newUser: User = new User(name, username, password);
    newUser.email = email;
    await backend
      .addUser(newUser)
      .then((res) => {
        dispatch(registerSuccess(username));
        setTimeout(() => {
          dispatch(registerReset());
          history.push("/login");
        }, 1000);
      })
      .catch((err) => {
        dispatch(
          registerFailure((err.response && err.response.status) || err.message)
        );
      });
  };
}
export function registerAttempt(username: string): UserAction {
  return {
    type: REGISTER_ATTEMPT,
    payload: { username },
  };
}

export function registerFailure(errorMessage: string): UserAction {
  return {
    type: REGISTER_FAILURE,
    payload: { username: errorMessage },
  };
}

export function registerSuccess(username: string): UserAction {
  return {
    type: REGISTER_SUCCESS,
    payload: { username },
  };
}

export function registerReset(): UserAction {
  return {
    type: REGISTER_RESET,
    payload: { username: "" },
  };
}

function logout(username: string): UserAction {
  return {
    type: LOGOUT,
    payload: { username },
  };
}
