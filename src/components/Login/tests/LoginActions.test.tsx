import configureMockStore from "redux-mock-store";
import thunk from "redux-thunk";

import * as LocalStorage from "backend/localStorage";
import * as LoginAction from "components/Login/LoginActions";
import * as LoginReducer from "components/Login/LoginReducer";
import * as RootAction from "rootActions";
import { User } from "types/user";

jest.mock("backend", () => {
  return {
    addUser: (user: User) => mockAddUser(user),
    authenticateUser: (username: string, password: string) =>
      mockAuthenticateUser(username, password),
  };
});

// mock the track and identify methods of segment analytics
global.analytics = { identify: jest.fn(), track: jest.fn() } as any;

const mockAddUser = jest.fn();
const mockAuthenticateUser = jest.fn();

const createMockStore = configureMockStore([thunk]);
const mockState = LoginReducer.defaultState;

const mockUser = {
  ...new User("testName", "testUsername", "testPass"),
  token: "testToken",
  email: "test@e.mail",
};
const loginAttempt: LoginAction.UserAction = {
  type: LoginAction.LOGIN_ATTEMPT,
  payload: { username: mockUser.username },
};
const loginFailure: LoginAction.UserAction = {
  type: LoginAction.LOGIN_FAILURE,
  payload: { username: mockUser.username },
};
const loginSuccess: LoginAction.UserAction = {
  type: LoginAction.LOGIN_SUCCESS,
  payload: { username: mockUser.username },
};
const logout: LoginAction.UserAction = {
  type: LoginAction.LOGOUT,
  payload: { username: mockUser.username },
};
const reset: RootAction.StoreAction = {
  type: RootAction.StoreActions.RESET,
};
const registerAttempt: LoginAction.UserAction = {
  type: LoginAction.REGISTER_ATTEMPT,
  payload: { username: mockUser.username },
};
const registerFailure: LoginAction.UserAction = {
  type: LoginAction.REGISTER_FAILURE,
  payload: { username: mockUser.username },
};
const registerSuccess: LoginAction.UserAction = {
  type: LoginAction.REGISTER_SUCCESS,
  payload: { username: mockUser.username },
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe("LoginAction", () => {
  test("register returns correct value", () => {
    expect(LoginAction.registerAttempt(mockUser.username)).toEqual(
      registerAttempt
    );
  });

  describe("asyncLogin", () => {
    it("login failure correctly affects state", async () => {
      mockAuthenticateUser.mockRejectedValue(new Error(mockUser.username));
      const mockStore = createMockStore(mockState);
      await mockStore.dispatch<any>(
        LoginAction.asyncLogin(mockUser.username, mockUser.password)
      );
      expect(mockStore.getActions()).toEqual([loginAttempt, loginFailure]);
    });

    it("login success correctly affects state", async () => {
      mockAuthenticateUser.mockResolvedValue(mockUser);
      const mockStore = createMockStore(mockState);
      await mockStore.dispatch<any>(
        LoginAction.asyncLogin(mockUser.username, mockUser.password)
      );
      expect(mockStore.getActions()).toEqual([loginAttempt, loginSuccess]);
    });
  });

  describe("asyncRegister", () => {
    it("register failure correctly affects state", async () => {
      mockAddUser.mockRejectedValue(new Error(mockUser.username));
      const mockStore = createMockStore(mockState);
      await mockStore.dispatch<any>(
        LoginAction.asyncRegister(
          mockUser.name,
          mockUser.username,
          mockUser.email,
          mockUser.password
        )
      );
      expect(mockStore.getActions()).toEqual([
        registerAttempt,
        registerFailure,
      ]);
    });

    it("register success correctly affects state", async () => {
      mockAddUser.mockResolvedValue(mockUser);
      const mockStore = createMockStore(mockState);
      await mockStore.dispatch<any>(
        LoginAction.asyncRegister(
          mockUser.name,
          mockUser.username,
          mockUser.email,
          mockUser.password
        )
      );
      expect(mockStore.getActions()).toEqual([
        registerAttempt,
        registerSuccess,
      ]);
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
    LocalStorage.setCurrentUser(mockUser);
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
  expect(LoginAction(mockUser.username)).toEqual({
    type: type,
    payload: { username: mockUser.username },
  });
}
