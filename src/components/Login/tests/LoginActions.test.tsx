import configureMockStore from "redux-mock-store";
import thunk from "redux-thunk";

import * as LocalStorage from "../../../backend/localStorage";
import * as rootAction from "../../../rootActions";
import { User } from "../../../types/user";
import * as action from "../LoginActions";
import * as reducer from "../LoginReducer";

const createMockStore = configureMockStore([thunk]);

const mockUser: User = new User("testName", "testUsername", "testPassword");

describe("LoginAction Tests", () => {
  let mockState: reducer.LoginState = reducer.defaultState;

  let loginAttempt: action.UserAction = {
    type: action.LOGIN_ATTEMPT,
    payload: { username: mockUser.username },
  };

  let loginSuccess: action.UserAction = {
    type: action.LOGIN_SUCCESS,
    payload: { username: mockUser.username },
  };

  let logout: action.UserAction = {
    type: action.LOGOUT,
    payload: { username: mockUser.username },
  };

  let reset: rootAction.StoreAction = {
    type: rootAction.StoreActions.RESET,
  };

  let registerAttempt: action.UserAction = {
    type: action.REGISTER_ATTEMPT,
    payload: { username: mockUser.username },
  };

  let registerFailure: action.UserAction = {
    type: action.REGISTER_FAILURE,
    payload: { username: mockUser.username },
  };

  test("register returns correct value", () => {
    expect(action.registerAttempt(mockUser.username)).toEqual(registerAttempt);
  });

  test("asyncLogin correctly affects state", () => {
    const mockStore = createMockStore(mockState);
    const mockDispatch = mockStore.dispatch<any>(
      action.asyncLogin(mockUser.username, mockUser.password)
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
      action.asyncRegister(
        mockUser.name,
        mockUser.username,
        mockUser.email,
        mockUser.password
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
    testActionCreatorAgainst(action.loginAttempt, action.LOGIN_ATTEMPT);
  });

  test("loginFailure returns correct value", () => {
    testActionCreatorAgainst(action.loginFailure, action.LOGIN_FAILURE);
  });

  test("loginSuccess returns correct value", () => {
    testActionCreatorAgainst(action.loginSuccess, action.LOGIN_SUCCESS);
  });

  test("registerAttempt returns correct value", () => {
    testActionCreatorAgainst(action.registerAttempt, action.REGISTER_ATTEMPT);
  });

  test("registerSuccess returns correct value", () => {
    testActionCreatorAgainst(action.registerSuccess, action.REGISTER_SUCCESS);
  });

  test("registerFailure returns correct value", () => {
    testActionCreatorAgainst(action.registerFailure, action.REGISTER_FAILURE);
  });

  test("loginReset returns correct value", () => {
    expect(action.loginReset()).toEqual({
      type: action.LOGIN_RESET,
      payload: { username: "" },
    });
  });

  test("registerReset returns correct value", () => {
    expect(action.registerReset()).toEqual({
      type: action.REGISTER_RESET,
      payload: { username: "" },
    });
  });

  test("loginAttempt returns correct value", () => {
    testActionCreatorAgainst(action.loginAttempt, action.LOGIN_ATTEMPT);
  });

  test("logout creates a proper action", () => {
    LocalStorage.setCurrentUser(mockUser);
    const mockStore = createMockStore(mockState);
    mockStore.dispatch<any>(action.logoutAndResetStore());
    expect(mockStore.getActions()).toEqual([logout, reset]);
    expect(LocalStorage.getCurrentUser()).toBe(null);
  });
});

function testActionCreatorAgainst(
  action: (name: string) => action.UserAction,
  type: action.LoginType
) {
  expect(action(mockUser.username)).toEqual({
    type: type,
    payload: { username: mockUser.username },
  });
}
