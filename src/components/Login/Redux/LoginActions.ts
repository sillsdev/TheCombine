import { PayloadAction } from "@reduxjs/toolkit";

import { User } from "api/models";
import { addUser, authenticateUser } from "backend";
import {
  setIsAdminTrueAction,
  setIsEmailVerifiedTrueAction,
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

/** Don't export! Only to be used when an admin logs in. */
function setIsAdminTrue(): PayloadAction {
  return setIsAdminTrueAction();
}

export function setIsEmailVerifiedTrue(): PayloadAction {
  return setIsEmailVerifiedTrueAction();
}

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

export function asyncLogIn(
  emailOrUsername: string,
  password: string,
  onSuccess?: () => void
) {
  return async (dispatch: StoreStateDispatch) => {
    dispatch(loginAttempt(emailOrUsername));
    await authenticateUser(emailOrUsername, password)
      .then(async (user: User) => {
        if (user.isAdmin) {
          dispatch(setIsAdminTrue());
        }
        if (user.isEmailVerified) {
          dispatch(setIsEmailVerifiedTrue());
        }
        dispatch(loginSuccess());
        onSuccess?.();
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
  onSignupSuccess?: () => void,
  onLoginSuccess?: () => void
) {
  return async (dispatch: StoreStateDispatch) => {
    dispatch(signupAttempt(username));
    // Create new user
    const user = newUser(name, username, password);
    user.email = email;
    await addUser(user)
      .then(() => {
        dispatch(signupSuccess());
        onSignupSuccess?.();
        setTimeout(async () => {
          dispatch(asyncLogIn(username, password, onLoginSuccess));
        }, 1000);
      })
      .catch((err) =>
        dispatch(signupFailure(err.response?.data ?? err.message))
      );
  };
}
