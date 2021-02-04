import * as backend from "backend";
import * as LocalStorage from "backend/localStorage";
import history, { Path } from "browserHistory";
import { reset } from "rootActions";
import { StoreStateDispatch } from "types/actions";
import { User } from "types/user";

export const LOGIN_ATTEMPT = "LOGIN_ATTEMPT";
export const LOGIN_FAILURE = "LOGIN_FAILURE";
export const LOGIN_RESET = "LOGIN_RESET";
export const LOGIN_SUCCESS = "LOGIN_SUCCESS";
export const LOGOUT = "LOGOUT";
export const REGISTER_ATTEMPT = "REGISTER_ATTEMPT";
export const REGISTER_FAILURE = "REGISTER_FAILURE";
export const REGISTER_RESET = "REGISTER_RESET";
export const REGISTER_SUCCESS = "REGISTER_SUCCESS";

export type LoginType =
  | typeof LOGIN_ATTEMPT
  | typeof LOGIN_FAILURE
  | typeof LOGIN_SUCCESS
  | typeof LOGIN_RESET
  | typeof REGISTER_ATTEMPT
  | typeof REGISTER_FAILURE
  | typeof REGISTER_SUCCESS
  | typeof REGISTER_RESET
  | typeof LOGOUT;

export interface LoginData {
  username: string;
  password?: string;
}

export interface UserAction {
  type: LoginType;
  payload: LoginData;
}

// thunk action creator
export function asyncLogin(username: string, password: string) {
  return async (dispatch: StoreStateDispatch) => {
    dispatch(loginAttempt(username));
    await backend
      .authenticateUser(username, password)
      .then(async (user: User) => {
        LocalStorage.setCurrentUser(user);
        dispatch(loginSuccess(user.username));
        if (user.hasAvatar) {
          backend.avatarSrc(user.id).then((avatar) => {
            LocalStorage.setAvatar(avatar);
          });
        }
        history.push(Path.ProjScreen);
      })
      .catch(() => {
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
  return (dispatch: StoreStateDispatch) => {
    const user = LocalStorage.getCurrentUser();
    if (user) {
      dispatch(logout(user.username));
    }
    dispatch(reset());
    LocalStorage.clearLocalStorage();
  };
}

export function asyncRegister(
  name: string,
  username: string,
  email: string,
  password: string
) {
  return async (dispatch: StoreStateDispatch) => {
    dispatch(registerAttempt(username));
    // Create new user
    const newUser = new User(name, username, password);
    newUser.email = email;
    await backend
      .addUser(newUser)
      .then((_res) => {
        dispatch(registerSuccess(username));
        setTimeout(() => {
          dispatch(registerReset());
          history.push(Path.Login);
        }, 1000);
      })
      .catch((err) => {
        dispatch(
          registerFailure((err.response && err.response.status) || err.message)
        );
      });
  };
}

export function asyncRegisterForEmailInvite(
  name: string,
  username: string,
  email: string,
  password: string
) {
  return async (dispatch: StoreStateDispatch) => {
    dispatch(registerAttempt(username));
    // Create new user
    const newUser = new User(name, username, password);
    newUser.email = email;
    await backend
      .addUser(newUser)
      .then((_res) => {
        dispatch(registerSuccess(username));
        setTimeout(() => {
          dispatch(registerReset());
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
