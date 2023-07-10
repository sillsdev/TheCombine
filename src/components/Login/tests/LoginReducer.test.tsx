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
  const dummyState: LoginState = {
    ...LoginReducer.defaultState,
    username: user.username,
    loginSuccess: false,
  };

  //The state while attempting to log in
  const loginAttemptState: LoginState = {
    username: "testUsername",
    loginAttempt: true,
    loginFailure: false,
    loginSuccess: false,
    signUpAttempt: false,
    signUpFailure: "",
    signUpSuccess: false,
  };

  const action: UserAction = {
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
    const loginFailureState: LoginState = {
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

  test("default state, expecting sign up", () => {
    const resultState: LoginState = {
      username: "testUsername",
      loginAttempt: false,
      loginFailure: false,
      loginSuccess: false,
      signUpAttempt: true,
      signUpFailure: "",
      signUpSuccess: false,
    };
    action.type = LoginActionTypes.SIGN_UP_ATTEMPT;

    expect(LoginReducer.loginReducer(dummyState, action)).toEqual(resultState);
  });

  test("default state, expecting login success", () => {
    const loginSuccessState: LoginState = {
      ...dummyState,
      username: user.username,
      loginSuccess: true,
    };
    action.type = LoginActionTypes.LOGIN_SUCCESS;

    expect(LoginReducer.loginReducer(dummyState, action)).toEqual(
      loginSuccessState
    );
  });

  test("default state, expecting sign up success", () => {
    const signUpSuccessState: LoginState = {
      ...dummyState,
      username: user.username,
      signUpAttempt: false,
      signUpSuccess: true,
    };
    action.type = LoginActionTypes.SIGN_UP_SUCCESS;
    expect(LoginReducer.loginReducer(dummyState, action)).toEqual(
      signUpSuccessState
    );
  });

  test("default state, expecting sign up failure", () => {
    const signUpFailureState: LoginState = {
      ...dummyState,
      signUpAttempt: false,
      signUpFailure: "testUsername",
      signUpSuccess: false,
    };
    action.type = LoginActionTypes.SIGN_UP_FAILURE;
    expect(LoginReducer.loginReducer(dummyState, action)).toEqual(
      signUpFailureState
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
