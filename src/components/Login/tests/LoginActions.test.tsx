import configureMockStore from "redux-mock-store";
import thunk from "redux-thunk";

import * as LocalStorage from "backend/localStorage";
import * as LoginAction from "components/Login/Redux/LoginActions";
import * as LoginReducer from "components/Login/Redux/LoginReducer";
import {
  LoginActionTypes,
  LoginType,
  UserAction,
} from "components/Login/Redux/LoginReduxTypes";
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
const loginAttempt: UserAction = {
  type: LoginActionTypes.LOGIN_ATTEMPT,
  payload: { username: mockUser.username },
};
const loginFailure: UserAction = {
  type: LoginActionTypes.LOGIN_FAILURE,
  payload: { username: mockUser.username },
};
const loginSuccess: UserAction = {
  type: LoginActionTypes.LOGIN_SUCCESS,
  payload: { username: mockUser.username },
};
const logout: UserAction = {
  type: LoginActionTypes.LOGOUT,
  payload: { username: mockUser.username },
};
const reset: RootAction.StoreAction = {
  type: RootAction.StoreActionTypes.RESET,
};
const registerAttempt: UserAction = {
  type: LoginActionTypes.REGISTER_ATTEMPT,
  payload: { username: mockUser.username },
};
const registerFailure: UserAction = {
  type: LoginActionTypes.REGISTER_FAILURE,
  payload: { username: mockUser.username },
};
const registerSuccess: UserAction = {
  type: LoginActionTypes.REGISTER_SUCCESS,
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
      LoginActionTypes.LOGIN_ATTEMPT
    );
  });

  test("loginFailure returns correct value", () => {
    testActionCreatorAgainst(
      LoginAction.loginFailure,
      LoginActionTypes.LOGIN_FAILURE
    );
  });

  test("loginSuccess returns correct value", () => {
    testActionCreatorAgainst(
      LoginAction.loginSuccess,
      LoginActionTypes.LOGIN_SUCCESS
    );
  });

  test("registerAttempt returns correct value", () => {
    testActionCreatorAgainst(
      LoginAction.registerAttempt,
      LoginActionTypes.REGISTER_ATTEMPT
    );
  });

  test("registerFailure returns correct value", () => {
    testActionCreatorAgainst(
      LoginAction.registerFailure,
      LoginActionTypes.REGISTER_FAILURE
    );
  });

  test("registerSuccess returns correct value", () => {
    testActionCreatorAgainst(
      LoginAction.registerSuccess,
      LoginActionTypes.REGISTER_SUCCESS
    );
  });

  test("loginReset returns correct value", () => {
    expect(LoginAction.loginReset()).toEqual({
      type: LoginActionTypes.LOGIN_RESET,
      payload: { username: "" },
    });
  });

  test("registerReset returns correct value", () => {
    expect(LoginAction.registerReset()).toEqual({
      type: LoginActionTypes.REGISTER_RESET,
      payload: { username: "" },
    });
  });

  test("loginAttempt returns correct value", () => {
    testActionCreatorAgainst(
      LoginAction.loginAttempt,
      LoginActionTypes.LOGIN_ATTEMPT
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
  LoginAction: (name: string) => UserAction,
  type: LoginType
) {
  expect(LoginAction(mockUser.username)).toEqual({
    type: type,
    payload: { username: mockUser.username },
  });
}
