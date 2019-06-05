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
export function asyncLogin(
  user: string,
  password: string,
  type: LoginType = LOGIN
) {
  return async (dispatch: Dispatch<UserAction>) => {
    //console.log('asyncPressButton called');
    dispatch(login(user, password, type));
  };
}

//pure action creator. LEAVE PURE!
export function login(
  user: string,
  password: string,
  type: LoginType = LOGIN
): UserAction {
  //console.log('PressButton called');
  return {
    type: type,
    payload: { user, password }
  };
}
