import * as action from "../LoginActions";
import * as reducer from "../LoginReducer";
import configureMockStore from "redux-mock-store";
import thunk from "redux-thunk";

const createMockStore = configureMockStore([thunk]);

const user = { user: "testUser", password: "testPass" };

describe("LoginAction Tests", () => {
  let mockState: reducer.LoginState = reducer.defaultState;
  let login: action.UserAction = {
    type: action.LOGIN,
    payload: user
  };

  let register: action.UserAction = {
    type: action.REGISTER,
    payload: user
  };

  test("login returns correct value", () => {
    expect(action.login(user.user, user.password)).toEqual(login);
  });

  test("register returns correct value", () => {
    expect(action.login(user.user, user.password, action.REGISTER)).toEqual(
      register
    );
  });

  test("asyncLogin correctly affects state", () => {
    const mockStore = createMockStore(mockState);
    const mockDispatch = mockStore.dispatch<any>(
      action.asyncLogin(user.user, user.password)
    );

    mockDispatch
      .then(() => {
        expect(mockStore.getActions()).toEqual([login]);
      })
      .catch(() => fail());
  });

  test("asyncRegister correctly affects state", () => {
    const mockStore = createMockStore(mockState);
    const mockDispatch = mockStore.dispatch<any>(
      action.asyncLogin(user.user, user.password, action.REGISTER)
    );

    mockDispatch
      .then(() => {
        expect(mockStore.getActions()).toEqual([register]);
      })
      .catch(() => fail());
  });
});
