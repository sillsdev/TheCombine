import { PayloadAction } from "@reduxjs/toolkit";
import Hex from "crypto-js/enc-hex";
import sha256 from "crypto-js/sha256";

import * as backend from "backend";
import router from "browserRouter";
import {
  setLoginAttemptAction,
  setLoginFailureAction,
  setLoginSuccessAction,
  setSignupAttemptAction,
  setSignupFailureAction,
  setSignupSuccessAction,
} from "components/Login/Redux//LoginReducer";
import { reset } from "rootActions";
import { StoreStateDispatch } from "types/Redux/actions";
import { Path } from "types/path";
import { newUser } from "types/user";

// Action Creation Functions

export function loginAttempt(username: string): PayloadAction {
  return setLoginAttemptAction(username);
}

export function loginFailure(error: string): PayloadAction {
  return setLoginFailureAction(error);
}

export function loginSuccess(): PayloadAction {
  return setLoginSuccessAction();
}

export function signupAttempt(username: string): PayloadAction {
  return setSignupAttemptAction(username);
}

export function signupFailure(error: string): PayloadAction {
  return setSignupFailureAction(error);
}

export function signupSuccess(): PayloadAction {
  return setSignupSuccessAction();
}

// Dispatch Functions

export function asyncLogIn(username: string, password: string) {
  return async (dispatch: StoreStateDispatch) => {
    dispatch(loginAttempt(username));
    await backend
      .authenticateUser(username, password)
      .then(async (user) => {
        dispatch(loginSuccess());
        // hash the user name and use it in analytics.identify
        const analyticsId = Hex.stringify(sha256(user.id));
        analytics.identify(analyticsId);
        router.navigate(Path.ProjScreen);
      })
      .catch((err) =>
        dispatch(loginFailure(err.response?.data ?? err.message))
      );
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
    dispatch(signupAttempt(username));
    // Create new user
    const user = newUser(name, username, password);
    user.email = email;
    await backend
      .addUser(user)
      .then(() => {
        dispatch(signupSuccess());
        setTimeout(() => {
          dispatch(asyncLogIn(username, password));
        }, 1000);
      })
      .catch((err) =>
        dispatch(signupFailure(err.response?.data ?? err.message))
      );
  };
}
