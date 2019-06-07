import { Dispatch } from "react";

export const LOGIN = "LOGIN";
export type LOGIN = typeof LOGIN;

export const REGISTER = "REGISTER";
export type REGISTER = typeof REGISTER;

export interface LoginData {
  user: string;
  password: string;
}
type LoginType = LOGIN | REGISTER;

//action types

export interface UserAction {
  type: LoginType;
  payload: LoginData;
}

//thunk action creator
export function asyncLogin(user: string, password: string) {
  return async (dispatch: Dispatch<UserAction>) => {
    dispatch(login(user, password));
  };
}

//pure action creator. LEAVE PURE!
export function login(user: string, password: string): UserAction {
  return {
    type: LOGIN,
    payload: { user, password }
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
