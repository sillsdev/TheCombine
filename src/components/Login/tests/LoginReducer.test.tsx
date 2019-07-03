import * as reducer from "../LoginReducer";
import {
  UserAction,
  LOGIN_ATTEMPT,
  LOGIN_FAILURE,
  REGISTER_ATTEMPT
} from "../LoginActions";

const user = { user: "testUser", password: "testPass" };

describe("LoginReducer Tests", () => {
  let dummySt: reducer.LoginState = {
    ...reducer.defaultState,
    user: user.user,
    success: false
  };
  //reducer.defaultState;
  let resultState: reducer.LoginState = {
    loginAttempt: false,
    loginFailure: false,
    registerAttempt: true,
    registerFailure: false,
    registerSuccess: false,
    success: false,
    user: "testUser"
  };

  //The state while attempting to log in
  let loginAttemptState: reducer.LoginState = {
    loginAttempt: true,
    loginFailure: false,
    registerAttempt: false,
    registerFailure: false,
    registerSuccess: false,
    success: false,
    user: "testUser"
  };

  let loginFailureState: reducer.LoginState = {
    ...reducer.defaultState,
    loginAttempt: false,
    loginFailure: true,
    user: user.user,
    success: false
  };

  let loginAttempt: UserAction = {
    type: LOGIN_ATTEMPT,
    payload: user
  };

  let loginFailure: UserAction = {
    type: LOGIN_FAILURE,
    payload: user
  };

  let registerAttempt: UserAction = {
    type: REGISTER_ATTEMPT,
    payload: user
  };

  // Test with no state
  test("no state, expecting login attempt", () => {
    expect(reducer.loginReducer(undefined, loginAttempt)).toEqual(
      loginAttemptState
    );
  });

  test("default state, expecting login attempt", () => {
    expect(reducer.loginReducer(dummySt, loginAttempt)).toEqual(
      loginAttemptState
    );
  });

  test("failed login, expecting no success", () => {
    expect(reducer.loginReducer(dummySt, loginFailure)).toEqual(
      loginFailureState
    );
  });

  test("default state, expecting register", () => {
    expect(reducer.loginReducer(dummySt, registerAttempt)).toEqual(resultState);
  });
});
