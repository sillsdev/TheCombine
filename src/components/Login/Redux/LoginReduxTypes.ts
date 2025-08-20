export enum LoginStatus {
  Default = "Default",
  Failure = "Failure",
  InProgress = "InProgress",
  Success = "Success",
}

export interface LoginState {
  error: string;
  isAdmin: boolean;
  isEmailVerified: boolean;
  loginStatus: LoginStatus;
  signupStatus: LoginStatus;
  username: string;
}

export const defaultState: LoginState = {
  error: "",
  isAdmin: false,
  isEmailVerified: false,
  loginStatus: LoginStatus.Default,
  signupStatus: LoginStatus.Default,
  username: "",
};

export interface LoginData {
  username: string;
  password?: string;
}
