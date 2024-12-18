import { User } from "api/models";
import { asyncLogIn, asyncSignUp } from "components/Login/Redux/LoginActions";
import { LoginStatus } from "components/Login/Redux/LoginReduxTypes";
import { setupStore } from "rootRedux/store";
import { newUser } from "types/user";

jest.mock("backend", () => ({
  addUser: (user: User) => mockAddUser(user),
  authenticateUser: (...args: any[]) => mockAuthenticateUser(...args),
}));

const mockAddUser = jest.fn();
const mockAuthenticateUser = jest.fn();

const mockEmail = "test@e.mail";
const mockName = "testName";
const mockPassword = "testPass";
const mockUsername = "testUsername";
const mockUser = {
  ...newUser(mockName, mockUsername, mockPassword),
  email: mockEmail,
};

beforeEach(() => {
  jest.clearAllMocks();
  jest.useFakeTimers();
});

describe("LoginAction", () => {
  describe("asyncLogIn", () => {
    it("correctly affects state on failure", async () => {
      const store = setupStore();
      mockAuthenticateUser.mockRejectedValueOnce({});
      await store.dispatch(asyncLogIn(mockUsername, mockPassword));
      const loginState = store.getState().loginState;
      expect(loginState.error).not.toEqual("");
      expect(loginState.loginStatus).toEqual(LoginStatus.Failure);
      expect(loginState.signupStatus).toEqual(LoginStatus.Default);
      expect(loginState.username).toEqual(mockUsername);
    });

    it("correctly affects state on success", async () => {
      const store = setupStore();
      mockAuthenticateUser.mockResolvedValueOnce(mockUser);
      await store.dispatch(asyncLogIn(mockUsername, mockPassword));
      const loginState = store.getState().loginState;
      expect(loginState.error).toEqual("");
      expect(loginState.loginStatus).toEqual(LoginStatus.Success);
      expect(loginState.signupStatus).toEqual(LoginStatus.Default);
      expect(loginState.username).toEqual(mockUsername);
    });
  });

  describe("asyncSignUp", () => {
    it("correctly affects state on failure", async () => {
      const store = setupStore();
      mockAddUser.mockRejectedValueOnce({});
      await store.dispatch(
        asyncSignUp(mockName, mockUsername, mockEmail, mockPassword)
      );
      const loginState = store.getState().loginState;
      expect(loginState.error).not.toEqual("");
      expect(loginState.loginStatus).toEqual(LoginStatus.Default);
      expect(loginState.signupStatus).toEqual(LoginStatus.Failure);
      expect(loginState.username).toEqual(mockUsername);

      // A failed signup does not trigger a login.
      jest.runAllTimers();
      expect(mockAuthenticateUser).not.toHaveBeenCalled();
    });

    it("correctly affects state on success", async () => {
      const store = setupStore();
      mockAddUser.mockResolvedValueOnce({});
      await store.dispatch(
        asyncSignUp(mockName, mockUsername, mockEmail, mockPassword)
      );
      const loginState = store.getState().loginState;
      expect(loginState.error).toEqual("");
      expect(loginState.loginStatus).toEqual(LoginStatus.Default);
      expect(loginState.signupStatus).toEqual(LoginStatus.Success);
      expect(loginState.username).toEqual(mockUsername);

      // A successful signup triggers a login using `setTimeout`.
      mockAuthenticateUser.mockRejectedValueOnce({});
      jest.runAllTimers();
      expect(mockAuthenticateUser).toHaveBeenCalledTimes(1);
    });
  });
});
