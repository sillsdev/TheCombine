import { PayloadAction } from "@reduxjs/toolkit";
import axios, { InternalAxiosRequestConfig } from "axios";

import * as backend from "backend";
import * as LocalStorage from "backend/localStorage";
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
import { RuntimeConfig } from "types/runtimeConfig";
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
const baseURL = `${RuntimeConfig.getInstance().baseUrl()}`;
const apiBaseURL = `${baseURL}`;
const axiosInstance = axios.create({ baseURL: apiBaseURL });

axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    console.log("TEST - in interceptor");
    const user = LocalStorage.getCurrentUser();
    if (user === undefined) {
      config.headers.authenticated = `${false}`;
    } else {
      config.headers.authenticated = `${true}`;
    }
    return config;
  },
  (error) => {
    console.log("hit intercept error");
    return Promise.reject(error);
  }
);

export function asyncLogIn(username: string, password: string) {
  return async (dispatch: StoreStateDispatch) => {
    console.log("TEST pre");
    dispatch(loginAttempt(username));
    try {
      const response = await axiosInstance.get("v1/users/authenticate");
      console.log(response);
    } catch (error) {
      console.error("Login error:", error);
    }

    await backend
      .authenticateUser(username, password)
      .then(async () => {
        dispatch(loginSuccess());
        router.navigate(Path.ProjScreen);
        // now allow analytics again if analytics true
      })
      .catch((err) =>
        dispatch(loginFailure(`${err.response?.status ?? err.message}`))
      )
      .finally(async () => {
        console.log("TEST aft");
        try {
          const response = await axiosInstance.request({
            method: "GET",
            url: apiBaseURL,
          });
          console.log(response);
        } catch (error) {
          console.error("Login error:", error);
        }
      });
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
