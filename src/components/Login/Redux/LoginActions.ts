import { PayloadAction } from "@reduxjs/toolkit";

import * as backend from "backend";
import {
  setLoginAttemptAction,
  setLoginFailureAction,
  setLoginSuccessAction,
  setSignupAttemptAction,
  setSignupFailureAction,
  setSignupSuccessAction,
} from "components/Login/Redux/LoginReducer";
import { type StoreStateDispatch } from "rootRedux/types";
import router from "router/browserRouter";
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

export function asyncLogIn(username: string, password: string) {
  return async (dispatch: StoreStateDispatch) => {
    dispatch(loginAttempt(username));
    await backend
      .authenticateUser(username, password)
      .then(async () => {
        dispatch(loginSuccess());
        router.navigate(Path.ProjScreen);
      })
      .catch((err) =>
        dispatch(loginFailure(`${err.response?.status ?? err.message}`))
      );
  };
}

export function asyncSignUp(
  name: string,
  username: string,
  email: string,
  password: string,
  onSuccess?: () => void
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
        if (onSuccess) {
          onSuccess();
        }
        setTimeout(() => {
          dispatch(asyncLogIn(username, password));
        }, 1000);
      })
      .catch((err) =>
        dispatch(signupFailure(err.response?.data ?? err.message))
      );
  };
}
