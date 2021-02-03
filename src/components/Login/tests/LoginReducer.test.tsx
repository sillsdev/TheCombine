import * as RootAction from "rootActions";
import * as LoginAction from "components/Login/LoginActions";
import * as LoginReducer from "components/Login/LoginReducer";

const user: LoginAction.LoginData = {
  username: "testUsername",
  password: "testPassword",
};

describe("LoginReducer Tests", () => {
  let dummyState: LoginReducer.LoginState = {
    ...LoginReducer.defaultState,
    username: user.username,
    loginSuccess: false,
  };

  //The state while attempting to log in
  let loginAttemptState: LoginReducer.LoginState = {
    username: "testUsername",
    loginAttempt: true,
    loginFailure: false,
    loginSuccess: false,
    registerAttempt: false,
    registerFailure: "",
    registerSuccess: false,
  };

  let action: LoginAction.UserAction = {
    type: LoginAction.LOGIN_ATTEMPT,
    payload: user,
  };

  // Test with no state
  test("no state, expecting login attempt", () => {
    action.type = LoginAction.LOGIN_ATTEMPT;
    expect(LoginReducer.loginReducer(undefined, action)).toEqual(
      loginAttemptState
    );
  });

  test("default state, expecting login attempt", () => {
    action.type = LoginAction.LOGIN_ATTEMPT;
    expect(LoginReducer.loginReducer(dummyState, action)).toEqual(
      loginAttemptState
    );
  });

  test("failed login, expecting no success", () => {
    let loginFailureState: LoginReducer.LoginState = {
      ...LoginReducer.defaultState,
      username: user.username,
      loginAttempt: false,
      loginFailure: true,
      loginSuccess: false,
    };

    action.type = LoginAction.LOGIN_FAILURE;
    expect(LoginReducer.loginReducer(dummyState, action)).toEqual(
      loginFailureState
    );
  });

  test("default state, expecting register", () => {
    let resultState: LoginReducer.LoginState = {
      username: "testUsername",
      loginAttempt: false,
      loginFailure: false,
      loginSuccess: false,
      registerAttempt: true,
      registerFailure: "",
      registerSuccess: false,
    };
    action.type = LoginAction.REGISTER_ATTEMPT;

    expect(LoginReducer.loginReducer(dummyState, action)).toEqual(resultState);
  });

  test("default state, expecting login success", () => {
    let loginSuccessState: LoginReducer.LoginState = {
      ...dummyState,
      username: user.username,
      loginSuccess: true,
    };
    action.type = LoginAction.LOGIN_SUCCESS;

    expect(LoginReducer.loginReducer(dummyState, action)).toEqual(
      loginSuccessState
    );
  });

  test("default state, expecting register success", () => {
    let registerSuccessState: LoginReducer.LoginState = {
      ...dummyState,
      username: user.username,
      registerAttempt: false,
      registerSuccess: true,
    };
    action.type = LoginAction.REGISTER_SUCCESS;
    expect(LoginReducer.loginReducer(dummyState, action)).toEqual(
      registerSuccessState
    );
  });

  test("default state, expecting register failure", () => {
    let registerFailureState: LoginReducer.LoginState = {
      ...dummyState,
      registerAttempt: false,
      registerFailure: "testUsername",
      registerSuccess: false,
    };
    action.type = LoginAction.REGISTER_FAILURE;
    expect(LoginReducer.loginReducer(dummyState, action)).toEqual(
      registerFailureState
    );
  });

  test("non-default state, expecting login reset", () => {
    action.type = LoginAction.LOGIN_RESET;
    expect(
      LoginReducer.loginReducer({} as LoginReducer.LoginState, action)
    ).toEqual(LoginReducer.defaultState);
  });

  test("non-default state, expecting register reset", () => {
    action.type = LoginAction.REGISTER_RESET;
    expect(
      LoginReducer.loginReducer({} as LoginReducer.LoginState, action)
    ).toEqual(LoginReducer.defaultState);
  });

  test("non-default state, expecting reset", () => {
    const resetAction: RootAction.StoreAction = {
      type: RootAction.StoreActions.RESET,
    };

    expect(
      LoginReducer.loginReducer({} as LoginReducer.LoginState, resetAction)
    ).toEqual(LoginReducer.defaultState);
  });
});
