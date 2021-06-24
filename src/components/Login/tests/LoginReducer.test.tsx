import * as LoginReducer from "components/Login/Redux/LoginReducer";
import {
  LoginActionTypes,
  LoginData,
  LoginState,
  UserAction,
} from "components/Login/Redux/LoginReduxTypes";
import { StoreAction, StoreActionTypes } from "rootActions";

const user: LoginData = {
  username: "testUsername",
  password: "testPassword",
};

describe("LoginReducer Tests", () => {
  let dummyState: LoginState = {
    ...LoginReducer.defaultState,
    username: user.username,
    loginSuccess: false,
  };

  //The state while attempting to log in
  let loginAttemptState: LoginState = {
    username: "testUsername",
    loginAttempt: true,
    loginFailure: false,
    loginSuccess: false,
    registerAttempt: false,
    registerFailure: "",
    registerSuccess: false,
  };

  let action: UserAction = {
    type: LoginActionTypes.LOGIN_ATTEMPT,
    payload: user,
  };

  // Test with no state
  test("no state, expecting login attempt", () => {
    action.type = LoginActionTypes.LOGIN_ATTEMPT;
    expect(LoginReducer.loginReducer(undefined, action)).toEqual(
      loginAttemptState
    );
  });

  test("default state, expecting login attempt", () => {
    action.type = LoginActionTypes.LOGIN_ATTEMPT;
    expect(LoginReducer.loginReducer(dummyState, action)).toEqual(
      loginAttemptState
    );
  });

  test("failed login, expecting no success", () => {
    let loginFailureState: LoginState = {
      ...LoginReducer.defaultState,
      username: user.username,
      loginAttempt: false,
      loginFailure: true,
      loginSuccess: false,
    };

    action.type = LoginActionTypes.LOGIN_FAILURE;
    expect(LoginReducer.loginReducer(dummyState, action)).toEqual(
      loginFailureState
    );
  });

  test("default state, expecting register", () => {
    let resultState: LoginState = {
      username: "testUsername",
      loginAttempt: false,
      loginFailure: false,
      loginSuccess: false,
      registerAttempt: true,
      registerFailure: "",
      registerSuccess: false,
    };
    action.type = LoginActionTypes.REGISTER_ATTEMPT;

    expect(LoginReducer.loginReducer(dummyState, action)).toEqual(resultState);
  });

  test("default state, expecting login success", () => {
    let loginSuccessState: LoginState = {
      ...dummyState,
      username: user.username,
      loginSuccess: true,
    };
    action.type = LoginActionTypes.LOGIN_SUCCESS;

    expect(LoginReducer.loginReducer(dummyState, action)).toEqual(
      loginSuccessState
    );
  });

  test("default state, expecting register success", () => {
    let registerSuccessState: LoginState = {
      ...dummyState,
      username: user.username,
      registerAttempt: false,
      registerSuccess: true,
    };
    action.type = LoginActionTypes.REGISTER_SUCCESS;
    expect(LoginReducer.loginReducer(dummyState, action)).toEqual(
      registerSuccessState
    );
  });

  test("default state, expecting register failure", () => {
    let registerFailureState: LoginState = {
      ...dummyState,
      registerAttempt: false,
      registerFailure: "testUsername",
      registerSuccess: false,
    };
    action.type = LoginActionTypes.REGISTER_FAILURE;
    expect(LoginReducer.loginReducer(dummyState, action)).toEqual(
      registerFailureState
    );
  });

  test("non-default state, expecting reset", () => {
    const resetAction: StoreAction = {
      type: StoreActionTypes.RESET,
    };

    expect(LoginReducer.loginReducer({} as LoginState, resetAction)).toEqual(
      LoginReducer.defaultState
    );
  });
});
