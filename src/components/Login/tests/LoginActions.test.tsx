import configureMockStore from "redux-mock-store";
import thunk from "redux-thunk";

import { User } from "api/models";
import * as LocalStorage from "backend/localStorage";
import * as LoginAction from "components/Login/Redux/LoginActions";
import * as LoginReducer from "components/Login/Redux/LoginReducer";
import {
  LoginActionTypes,
  LoginType,
  UserAction,
} from "components/Login/Redux/LoginReduxTypes";
import * as RootAction from "rootActions";
import { newUser } from "types/user";

jest.mock("backend", () => ({
  addUser: (user: User) => mockAddUser(user),
  authenticateUser: (username: string, password: string) =>
    mockAuthenticateUser(username, password),
}));

// Mock the track and identify methods of segment analytics.
global.analytics = { identify: jest.fn(), track: jest.fn() } as any;

const mockAddUser = jest.fn();
const mockAuthenticateUser = jest.fn();

const createMockStore = configureMockStore([thunk]);
const mockState = LoginReducer.defaultState;

const mockUser = {
  ...newUser("testName", "testUsername", "testPass"),
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

  describe("Action creators return correct value.", () => {
    test("loginAttempt", () => {
      testActionCreatorAgainst(
        LoginAction.loginAttempt,
        LoginActionTypes.LOGIN_ATTEMPT
      );
    });

    test("loginFailure", () => {
      testActionCreatorAgainst(
        LoginAction.loginFailure,
        LoginActionTypes.LOGIN_FAILURE
      );
    });

    test("loginSuccess", () => {
      testActionCreatorAgainst(
        LoginAction.loginSuccess,
        LoginActionTypes.LOGIN_SUCCESS
      );
    });

    test("registerAttempt", () => {
      testActionCreatorAgainst(
        LoginAction.registerAttempt,
        LoginActionTypes.REGISTER_ATTEMPT
      );
    });

    test("registerFailure", () => {
      testActionCreatorAgainst(
        LoginAction.registerFailure,
        LoginActionTypes.REGISTER_FAILURE
      );
    });

    test("registerSuccess", () => {
      testActionCreatorAgainst(
        LoginAction.registerSuccess,
        LoginActionTypes.REGISTER_SUCCESS
      );
    });
  });

  test("logout creates a proper action", () => {
    LocalStorage.setCurrentUser(mockUser);
    const mockStore = createMockStore(mockState);
    mockStore.dispatch<any>(LoginAction.logoutAndResetStore());
    expect(mockStore.getActions()).toEqual([reset]);
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
