import * as action from "../LoginActions";
import * as reducer from "../LoginReducer";
import configureMockStore from "redux-mock-store";
import thunk from "redux-thunk";

const createMockStore = configureMockStore([thunk]);
jest.mock("axios", () => {
  return {
    post: jest.fn().mockResolvedValue({ data: {} }),
    create: jest.fn(() => {
      return jest.fn().mockReturnThis();
    })
  };
});

// jest.mock("history", () => {
//   console.log("Create browser history");

//   return {
//     createBrowserHistory: jest.fn(() => {
//       return {
//         push: jest.fn()
//       };
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

  let register: action.UserAction = {
    type: action.REGISTER,
    payload: user
  };

  test("register returns correct value", () => {
    expect(action.register(user.user, user.password)).toEqual(register);
  });

  test("asyncLogin correctly affects state", () => {
    const mockStore = createMockStore(mockState);
    const mockDispatch = mockStore.dispatch<any>(
      action.asyncLogin(user.user, user.password)
    );

    mockDispatch
      .then(() => {
        expect(mockStore.getActions()).toEqual([loginAttempt]);
      })
      .catch(() => fail());
  });

  test("asyncRegister correctly affects state", () => {
    const mockStore = createMockStore(mockState);
    const mockDispatch = mockStore.dispatch<any>(
      action.asyncRegister(user.user, user.password)
    );

    mockDispatch
      .then(() => {
        expect(mockStore.getActions()).toEqual([register, action.asyncLogin]);
      })
      .catch(() => fail());
  });
});
