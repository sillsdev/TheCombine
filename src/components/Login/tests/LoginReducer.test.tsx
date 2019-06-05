import * as reducer from "../LoginReducer";
import { UserAction, LOGIN, REGISTER } from "../LoginActions";

const user = { user: "testUser", password: "testPass" };

describe("tempReducer Tests", () => {
  let dummySt: reducer.LoginState = reducer.defaultState;
  let resultState: reducer.LoginState = {
    user: user.user,
    success: true
  };

  let login: UserAction = {
    type: LOGIN,
    payload: user
  };

  let register: UserAction = {
    type: REGISTER,
    payload: user
  };

  // Test with no state
  test("no state, expecting default state", () => {
    expect(reducer.loginReducer(undefined, login)).toEqual(
      reducer.defaultState
    );
  });

  test("default state, expecting login", () => {
    expect(reducer.loginReducer(dummySt, login)).toEqual(resultState);
  });

  test("default state, expecting register", () => {
    expect(reducer.loginReducer(dummySt, register)).toEqual(resultState);
  });
});
