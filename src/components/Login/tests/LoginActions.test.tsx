import configureMockStore from "redux-mock-store";
import thunk from "redux-thunk";

import * as LocalStorage from "backend/localStorage";
import * as RootAction from "rootActions";
import { User } from "types/user";
import * as LoginAction from "components/Login/LoginActions";
import * as LoginReducer from "components/Login/LoginReducer";

const createMockStore = configureMockStore([thunk]);

const user = {
  ...new User("testName", "testUsername", "testPass"),
  token: "testToken",
  email: "test@e.mail",
};

describe("LoginAction Tests", () => {
  let mockState: LoginReducer.LoginState = LoginReducer.defaultState;

  let loginAttempt: LoginAction.UserAction = {
    type: LoginAction.LOGIN_ATTEMPT,
    payload: { username: user.username },
  };

  let loginSuccess: LoginAction.UserAction = {
    type: LoginAction.LOGIN_SUCCESS,
    payload: { username: user.username },
  };

  let logout: LoginAction.UserAction = {
    type: LoginAction.LOGOUT,
    payload: { username: user.username },
  };

  let reset: RootAction.StoreAction = {
    type: RootAction.StoreActions.RESET,
  };

  let registerAttempt: LoginAction.UserAction = {
    type: LoginAction.REGISTER_ATTEMPT,
    payload: { username: user.username },
  };

  let registerFailure: LoginAction.UserAction = {
    type: LoginAction.REGISTER_FAILURE,
    payload: { username: user.username },
  };

  test("register returns correct value", () => {
    expect(LoginAction.registerAttempt(user.username)).toEqual(registerAttempt);
  });

  test("asyncLogin correctly affects state", () => {
    const mockStore = createMockStore(mockState);
    const mockDispatch = mockStore.dispatch<any>(
      LoginAction.asyncLogin(user.username, user.password)
    );

    mockDispatch
      .then(() => {
        expect(mockStore.getActions()).toEqual([loginAttempt, loginSuccess]);
      })
      .catch((err: any) => {
        console.log(err);
        fail();
      });
  });

  test("asyncRegister correctly affects state", () => {
    const mockStore = createMockStore(mockState);
    const mockDispatch = mockStore.dispatch<any>(
      LoginAction.asyncRegister(
        user.name,
        user.username,
        user.email,
        user.password
      )
    );

    mockDispatch
      .then(() => {
        expect(mockStore.getActions()).toEqual([
          registerAttempt,
          registerFailure,
        ]);
      })
      .catch((err: any) => {
        console.log(err);
        fail();
      });
  });

  test("loginAttempt returns correct value", () => {
    testActionCreatorAgainst(
      LoginAction.loginAttempt,
      LoginAction.LOGIN_ATTEMPT
    );
  });

  test("loginFailure returns correct value", () => {
    testActionCreatorAgainst(
      LoginAction.loginFailure,
      LoginAction.LOGIN_FAILURE
    );
  });

  test("loginSuccess returns correct value", () => {
    testActionCreatorAgainst(
      LoginAction.loginSuccess,
      LoginAction.LOGIN_SUCCESS
    );
  });

  test("registerAttempt returns correct value", () => {
    testActionCreatorAgainst(
      LoginAction.registerAttempt,
      LoginAction.REGISTER_ATTEMPT
    );
  });

  test("registerFailure returns correct value", () => {
    testActionCreatorAgainst(
      LoginAction.registerFailure,
      LoginAction.REGISTER_FAILURE
    );
  });

  test("registerSuccess returns correct value", () => {
    testActionCreatorAgainst(
      LoginAction.registerSuccess,
      LoginAction.REGISTER_SUCCESS
    );
  });

  test("loginReset returns correct value", () => {
    expect(LoginAction.loginReset()).toEqual({
      type: LoginAction.LOGIN_RESET,
      payload: { username: "" },
    });
  });

  test("registerReset returns correct value", () => {
    expect(LoginAction.registerReset()).toEqual({
      type: LoginAction.REGISTER_RESET,
      payload: { username: "" },
    });
  });

  test("loginAttempt returns correct value", () => {
    testActionCreatorAgainst(
      LoginAction.loginAttempt,
      LoginAction.LOGIN_ATTEMPT
    );
  });

  test("logout creates a proper action", () => {
    LocalStorage.setCurrentUser(user);
    const mockStore = createMockStore(mockState);
    mockStore.dispatch<any>(LoginAction.logoutAndResetStore());
    expect(mockStore.getActions()).toEqual([logout, reset]);
    expect(LocalStorage.getUserId()).toEqual("");
  });
});

function testActionCreatorAgainst(
  LoginAction: (name: string) => LoginAction.UserAction,
  type: LoginAction.LoginType
) {
  expect(LoginAction(user.username)).toEqual({
    type: type,
    payload: { username: user.username },
  });
}
