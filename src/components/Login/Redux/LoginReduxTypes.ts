export enum LoginActionTypes {
  LOGIN_ATTEMPT = "LOGIN_ATTEMPT",
  LOGIN_FAILURE = "LOGIN_FAILURE",
  LOGIN_SUCCESS = "LOGIN_SUCCESS",
  SIGN_UP_ATTEMPT = "SIGN_UP_ATTEMPT",
  SIGN_UP_FAILURE = "SIGN_UP_FAILURE",
  SIGN_UP_SUCCESS = "SIGN_UP_SUCCESS",
}

export interface LoginState {
  username: string;
  loginAttempt: boolean;
  loginFailure: boolean;
  loginSuccess: boolean;
  signUpAttempt: boolean;
  signUpFailure: string;
  signUpSuccess: boolean;
}

export type LoginType =
  | typeof LoginActionTypes.LOGIN_ATTEMPT
  | typeof LoginActionTypes.LOGIN_FAILURE
  | typeof LoginActionTypes.LOGIN_SUCCESS
  | typeof LoginActionTypes.SIGN_UP_ATTEMPT
  | typeof LoginActionTypes.SIGN_UP_FAILURE
  | typeof LoginActionTypes.SIGN_UP_SUCCESS;

export interface LoginData {
  username: string;
  password?: string;
}

export interface UserAction {
  type: LoginType;
  payload: LoginData;
}
