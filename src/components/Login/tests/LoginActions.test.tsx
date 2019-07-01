import * as action from "../LoginActions";
import * as reducer from "../LoginReducer";
import configureMockStore from "redux-mock-store";
import thunk from "redux-thunk";

const createMockStore = configureMockStore([thunk]);
// jest.mock("axios", () => {
//   return {
//     post: jest.fn().mockResolvedValue({ data: {} }),
//     create: jest.fn(() => {
//       return jest.fn().mockReturnThis();
//     })
//   };
// });

const user = { user: "testUser", password: "testPass" };

describe("LoginAction Tests", () => {
  let mockState: reducer.LoginState = reducer.defaultState;

  let loginAttempt: action.UserAction = {
    type: action.LOGIN_ATTEMPT,
    payload: user
  };

  let loginSuccess: action.UserAction = {
    type: action.LOGIN_SUCCESS,
    payload: user
  };

  let registerAttempt: action.UserAction = {
    type: action.REGISTER_ATTEMPT,
    payload: { user: user.user }
  };

  test("register returns correct value", () => {
    expect(action.registerAttempt(user.user)).toEqual(registerAttempt);
  });

  test("asyncLogin correctly affects state", () => {
    const mockStore = createMockStore(mockState);
    const mockDispatch = mockStore.dispatch<any>(
      action.asyncLogin(user.user, user.password)
    );

    mockDispatch.then(() => {
      expect(mockStore.getActions()).toEqual([loginAttempt]);
    });
    // .catch(() => fail());
  });

  test("asyncRegister correctly affects state", () => {
    const mockStore = createMockStore(mockState);
    const mockDispatch = mockStore.dispatch<any>(
      action.asyncRegister("name", user.user, user.password)
    );

    mockDispatch.then(() => {
      expect(mockStore.getActions()).toEqual([
        registerAttempt,
        action.asyncLogin
      ]);
    });
    // .catch(() => fail());
  });
});
