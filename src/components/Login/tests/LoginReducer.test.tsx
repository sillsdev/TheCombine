import * as reducer from "../LoginReducer";
import {
  UserAction,
  LOGIN_ATTEMPT,
  LOGIN_FAILURE,
  REGISTER_ATTEMPT,
  LOGIN_SUCCESS,
  REGISTER_SUCCESS,
  REGISTER_FAILURE,
  LOGIN_RESET,
  REGISTER_RESET,
} from "../LoginActions";
import { StoreActions, StoreAction } from "../../../rootActions";

const user = { user: "testUser", password: "testPass" };

describe("LoginReducer Tests", () => {
  let dummyState: reducer.LoginState = {
    ...reducer.defaultState,
    user: user.user,
    success: false,
  };

  //The state while attempting to log in
  let loginAttemptState: reducer.LoginState = {
    loginAttempt: true,
    loginFailure: false,
    registerAttempt: false,
    registerFailure: "",
    registerSuccess: false,
    success: false,
    user: "testUser",
  };

  let action: UserAction = {
    type: LOGIN_ATTEMPT,
    payload: user,
  };

  // Test with no state
  test("no state, expecting login attempt", () => {
    action.type = LOGIN_ATTEMPT;
    expect(reducer.loginReducer(undefined, action)).toEqual(loginAttemptState);
  });

  test("default state, expecting login attempt", () => {
    action.type = LOGIN_ATTEMPT;
    expect(reducer.loginReducer(dummyState, action)).toEqual(loginAttemptState);
  });

  test("failed login, expecting no success", () => {
    let loginFailureState: reducer.LoginState = {
      ...reducer.defaultState,
      loginAttempt: false,
      loginFailure: true,
      user: user.user,
      success: false,
    };

    action.type = LOGIN_FAILURE;
    expect(reducer.loginReducer(dummyState, action)).toEqual(loginFailureState);
  });

  test("default state, expecting register", () => {
    let resultState: reducer.LoginState = {
      loginAttempt: false,
      loginFailure: false,
      registerAttempt: true,
      registerFailure: "",
      registerSuccess: false,
      success: false,
      user: "testUser",
    };
    action.type = REGISTER_ATTEMPT;

    expect(reducer.loginReducer(dummyState, action)).toEqual(resultState);
  });

  test("default state, expecting login success", () => {
    let loginSuccessState: reducer.LoginState = {
      ...dummyState,
      user: user.user,
      success: true,
    };
    action.type = LOGIN_SUCCESS;

    expect(reducer.loginReducer(dummyState, action)).toEqual(loginSuccessState);
  });

  test("default state, expecting register success", () => {
    let registerSuccessState: reducer.LoginState = {
      ...dummyState,
      user: user.user,
      registerAttempt: false,
      registerSuccess: true,
    };
    action.type = REGISTER_SUCCESS;
    expect(reducer.loginReducer(dummyState, action)).toEqual(
      registerSuccessState
    );
  });

  test("default state, expecting register failure", () => {
    let registerFailureState: reducer.LoginState = {
      ...dummyState,
      registerAttempt: false,
      registerSuccess: false,
      registerFailure: "testUser",
    };
    action.type = REGISTER_FAILURE;
    expect(reducer.loginReducer(dummyState, action)).toEqual(
      registerFailureState
    );
  });

  test("non-default state, expecting login reset", () => {
    action.type = LOGIN_RESET;
    expect(reducer.loginReducer({} as reducer.LoginState, action)).toEqual(
      reducer.defaultState
    );
  });

  test("non-default state, expecting register reset", () => {
    action.type = REGISTER_RESET;
    expect(reducer.loginReducer({} as reducer.LoginState, action)).toEqual(
      reducer.defaultState
    );
  });

  test("non-default state, expecting reset", () => {
    const resetAction: StoreAction = {
      type: StoreActions.RESET,
    };

    expect(reducer.loginReducer({} as reducer.LoginState, resetAction)).toEqual(
      reducer.defaultState
    );
  });
});
