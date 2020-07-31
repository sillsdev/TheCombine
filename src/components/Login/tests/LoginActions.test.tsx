import * as action from "../LoginActions";
import * as reducer from "../LoginReducer";
import * as rootAction from "../../../rootActions";
import configureMockStore from "redux-mock-store";
import thunk from "redux-thunk";
import * as LocalStorage from "../../../backend/localStorage";
import { User } from "../../../types/user";

const createMockStore = configureMockStore([thunk]);

const user = {
  ...new User("testName", "testUsername", "testPassword"),
  token: "testToken",
  email: "test@e.mail",
};

describe("LoginAction Tests", () => {
  let mockState: reducer.LoginState = reducer.defaultState;

  let loginAttempt: action.UserAction = {
    type: action.LOGIN_ATTEMPT,
    payload: { user: user.username },
  };

  let loginSuccess: action.UserAction = {
    type: action.LOGIN_SUCCESS,
    payload: { user: user.username },
  };

  let logout: action.UserAction = {
    type: action.LOGOUT,
    payload: { user: user.username },
  };

  let reset: rootAction.StoreAction = {
    type: rootAction.StoreActions.RESET,
  };

  let registerAttempt: action.UserAction = {
    type: action.REGISTER_ATTEMPT,
    payload: { user: user.username },
  };

  let registerFailure: action.UserAction = {
    type: action.REGISTER_FAILURE,
    payload: { user: user.username },
  };

  test("register returns correct value", () => {
    expect(action.registerAttempt(user.username)).toEqual(registerAttempt);
  });

  test("asyncLogin correctly affects state", () => {
    const mockStore = createMockStore(mockState);
    const mockDispatch = mockStore.dispatch<any>(
      action.asyncLogin(user.username, user.password)
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
      action.asyncRegister(user.name, user.username, user.email, user.password)
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
      payload: { user: "" },
    });
  });

  test("registerReset returns correct value", () => {
    expect(action.registerReset()).toEqual({
      type: action.REGISTER_RESET,
      payload: { user: "" },
    });
  });

  test("loginAttempt returns correct value", () => {
    testActionCreatorAgainst(action.loginAttempt, action.LOGIN_ATTEMPT);
  });

  test("logout creates a proper action", () => {
    LocalStorage.setUser(user);
    const mockStore = createMockStore(mockState);
    mockStore.dispatch<any>(action.logoutAndResetStore());
    expect(mockStore.getActions()).toEqual([logout, reset]);
    expect(LocalStorage.getUserId()).toEqual("");
  });
});

function testActionCreatorAgainst(
  action: (name: string) => action.UserAction,
  type: action.LoginType
) {
  expect(action(user.username)).toEqual({
    type: type,
    payload: { user: user.username },
  });
}
