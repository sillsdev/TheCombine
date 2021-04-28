import hash from "crypto";

import * as backend from "backend";
import * as LocalStorage from "backend/localStorage";
import history, { Path } from "browserHistory";
import {
  LoginActionTypes,
  UserAction,
} from "components/Login/Redux/LoginReduxTypes";
import { reset } from "rootActions";
import { StoreStateDispatch } from "types/Redux/actions";
import { User } from "types/user";

// thunk action creator
export function asyncLogin(username: string, password: string) {
  return async (dispatch: StoreStateDispatch) => {
    dispatch(loginAttempt(username));
    await backend
      .authenticateUser(username, password)
      .then(async (user: User) => {
        LocalStorage.setCurrentUser(user);
        dispatch(loginSuccess(user.username));
        // hash the user name and use it in analytics.identify
        const analyticsId = hash
          .createHash("sha256")
          .update(user.id)
          .digest("hex");
        analytics.identify(analyticsId);
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

export function loginReset(): UserAction {
  return {
    type: LoginActionTypes.LOGIN_RESET,
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
    type: LoginActionTypes.REGISTER_ATTEMPT,
    payload: { username },
  };
}

export function registerFailure(errorMessage: string): UserAction {
  return {
    type: LoginActionTypes.REGISTER_FAILURE,
    payload: { username: errorMessage },
  };
}

export function registerSuccess(username: string): UserAction {
  return {
    type: LoginActionTypes.REGISTER_SUCCESS,
    payload: { username },
  };
}

export function registerReset(): UserAction {
  return {
    type: LoginActionTypes.REGISTER_RESET,
    payload: { username: "" },
  };
}

function logout(username: string): UserAction {
  return {
    type: LoginActionTypes.LOGOUT,
    payload: { username },
  };
}
