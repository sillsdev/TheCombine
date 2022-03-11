import SHA from "sha.js";

import * as backend from "backend";
import history, { Path } from "browserHistory";
import {
  LoginActionTypes,
  UserAction,
} from "components/Login/Redux/LoginReduxTypes";
import { reset } from "rootActions";
import { StoreStateDispatch } from "types/Redux/actions";
import { newUser } from "types/user";

// thunk action creator
export function asyncLogin(username: string, password: string) {
  return async (dispatch: StoreStateDispatch) => {
    dispatch(loginAttempt(username));
    await backend
      .authenticateUser(username, password)
      .then(async (user) => {
        dispatch(loginSuccess(user.username));
        // hash the user name and use it in analytics.identify
        const analyticsId = SHA("sha256").update(user.id).digest("hex");
        analytics.identify(analyticsId);
        history.push(Path.ProjScreen);
      })
      .catch(() => dispatch(loginFailure(username)));
  };
}

export function loginAttempt(username: string): UserAction {
  return {
    type: LoginActionTypes.LOGIN_ATTEMPT,
    payload: { username },
  };
}

export function loginFailure(username: string): UserAction {
  return {
    type: LoginActionTypes.LOGIN_FAILURE,
    payload: { username },
  };
}

export function loginSuccess(username: string): UserAction {
  return {
    type: LoginActionTypes.LOGIN_SUCCESS,
    payload: { username },
  };
}

export function logoutAndResetStore() {
  return (dispatch: StoreStateDispatch) => {
    dispatch(reset());
  };
}

export function asyncSignUp(
  name: string,
  username: string,
  email: string,
  password: string
) {
  return async (dispatch: StoreStateDispatch) => {
    dispatch(signUpAttempt(username));
    // Create new user
    const user = newUser(name, username, password);
    user.email = email;
    await backend
      .addUser(user)
      .then(() => {
        dispatch(signUpSuccess(username));
        setTimeout(() => {
          dispatch(asyncLogin(username, password));
        }, 1000);
      })
      .catch((err) =>
        dispatch(signUpFailure(err.response?.status ?? err.message))
      );
  };
}

export function signUpAttempt(username: string): UserAction {
  return {
    type: LoginActionTypes.SIGN_UP_ATTEMPT,
    payload: { username },
  };
}

export function signUpFailure(errorMessage: string): UserAction {
  return {
    type: LoginActionTypes.SIGN_UP_FAILURE,
    payload: { username: errorMessage },
  };
}

export function signUpSuccess(username: string): UserAction {
  return {
    type: LoginActionTypes.SIGN_UP_SUCCESS,
    payload: { username },
  };
}
