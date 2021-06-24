export enum LoginActionTypes {
  LOGIN_ATTEMPT = "LOGIN_ATTEMPT",
  LOGIN_FAILURE = "LOGIN_FAILURE",
  LOGIN_SUCCESS = "LOGIN_SUCCESS",
  REGISTER_ATTEMPT = "REGISTER_ATTEMPT",
  REGISTER_FAILURE = "REGISTER_FAILURE",
  REGISTER_SUCCESS = "REGISTER_SUCCESS",
}

export interface LoginState {
  username: string;
  loginAttempt: boolean;
  loginFailure: boolean;
  loginSuccess: boolean;
  registerAttempt: boolean;
  registerFailure: string;
  registerSuccess: boolean;
}

export type LoginType =
  | typeof LoginActionTypes.LOGIN_ATTEMPT
  | typeof LoginActionTypes.LOGIN_FAILURE
  | typeof LoginActionTypes.LOGIN_SUCCESS
  | typeof LoginActionTypes.REGISTER_ATTEMPT
  | typeof LoginActionTypes.REGISTER_FAILURE
  | typeof LoginActionTypes.REGISTER_SUCCESS;

export interface LoginData {
  username: string;
  password?: string;
}

export interface UserAction {
  type: LoginType;
  payload: LoginData;
}
