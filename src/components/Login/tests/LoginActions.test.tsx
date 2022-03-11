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
const signUpAttempt: UserAction = {
  type: LoginActionTypes.SIGN_UP_ATTEMPT,
  payload: { username: mockUser.username },
};
const signUpFailure: UserAction = {
  type: LoginActionTypes.SIGN_UP_FAILURE,
  payload: { username: mockUser.username },
};
const signUpSuccess: UserAction = {
  type: LoginActionTypes.SIGN_UP_SUCCESS,
  payload: { username: mockUser.username },
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe("LoginAction", () => {
  test("sign up returns correct value", () => {
    expect(LoginAction.signUpAttempt(mockUser.username)).toEqual(signUpAttempt);
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

  describe("asyncSignUp", () => {
    it("sign up failure correctly affects state", async () => {
      mockAddUser.mockRejectedValue(new Error(mockUser.username));
      const mockStore = createMockStore(mockState);
      await mockStore.dispatch<any>(
        LoginAction.asyncSignUp(
          mockUser.name,
          mockUser.username,
          mockUser.email,
          mockUser.password
        )
      );
      expect(mockStore.getActions()).toEqual([signUpAttempt, signUpFailure]);
    });

    it("sign up success correctly affects state", async () => {
      mockAddUser.mockResolvedValue(mockUser);
      const mockStore = createMockStore(mockState);
      await mockStore.dispatch<any>(
        LoginAction.asyncSignUp(
          mockUser.name,
          mockUser.username,
          mockUser.email,
          mockUser.password
        )
      );
      expect(mockStore.getActions()).toEqual([signUpAttempt, signUpSuccess]);
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

    test("signUpAttempt", () => {
      testActionCreatorAgainst(
        LoginAction.signUpAttempt,
        LoginActionTypes.SIGN_UP_ATTEMPT
      );
    });

    test("signUpFailure", () => {
      testActionCreatorAgainst(
        LoginAction.signUpFailure,
        LoginActionTypes.SIGN_UP_FAILURE
      );
    });

    test("signUpSuccess", () => {
      testActionCreatorAgainst(
        LoginAction.signUpSuccess,
        LoginActionTypes.SIGN_UP_SUCCESS
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
