import * as reducer from "../LoginReducer";
import {
  UserAction,
  REGISTER,
  LOGIN_ATTEMPT,
  LOGIN_FAILURE
} from "../LoginActions";

const user = { user: "testUser", password: "testPass" };

describe("tempReducer Tests", () => {
  let dummySt: reducer.LoginState = reducer.defaultState;
  let resultState: reducer.LoginState = {
    user: user.user,
    success: true
  };

  //The state while attempting to log in
  let loginAttemptState: reducer.LoginState = {
    user: user.user,
    success: false,
    loginAttempt: true
  };

  let loginFailureState: reducer.LoginState = {
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

  let register: UserAction = {
    type: REGISTER,
    payload: user
  };

  // Test with no state
  test("no state, expecting default state", () => {
    expect(reducer.loginReducer(undefined, loginAttempt)).toEqual(
      reducer.defaultState
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
    expect(reducer.loginReducer(dummySt, register)).toEqual(resultState);
  });
});
