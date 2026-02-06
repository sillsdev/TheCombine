import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import configureMockStore from "redux-mock-store";

import Login, { LoginId, LoginTextId } from "components/Login/Login";
import { defaultState as loginState } from "components/Login/Redux/LoginReduxTypes";
import MockCaptcha from "components/Login/tests/MockCaptcha";

jest.mock("backend", () => ({
  getBannerText: () => Promise.resolve(""),
}));
jest.mock("components/Login/Captcha", () => ({
  __esModule: true,
  default: (props: any) => <MockCaptcha {...props} />,
}));
jest.mock("components/Login/Redux/LoginActions", () => ({
  asyncLogIn: (...args: any[]) => mockAsyncLogIn(...args),
}));
jest.mock("rootRedux/hooks", () => {
  return {
    ...jest.requireActual("rootRedux/hooks"),
    useAppDispatch: () => jest.fn(),
  };
});

const errorClass = "Mui-error";
const mockAsyncLogIn = jest.fn();
const mockStore = configureMockStore()({ loginState });

const renderLogin = async (): Promise<void> => {
  await act(async () => {
    render(
      <Provider store={mockStore}>
        <Login />
      </Provider>
    );
  });
};

/** Type the given value into the field with the given ID. */
const typeInField = async (id: LoginTextId, value: string): Promise<void> => {
  await userEvent.type(screen.getByLabelText(new RegExp(id)), value);
};

/** Click the Login button and confirm whether the field with the given ID has an error. */
const loginAndCheckError = async (errorId?: LoginId): Promise<void> => {
  // Login button click
  await userEvent.click(screen.getByTestId(LoginId.ButtonLogIn));

  // Username field check
  const userLabel = screen.getByText(LoginTextId.LabelUsername);
  const userClasses = userLabel.className.split(" ");
  if (errorId === LoginId.FieldUsername) {
    expect(userClasses).toContain(errorClass);
  } else {
    expect(userClasses).not.toContain(errorClass);
  }

  // Password field check
  const passLabel = screen.getByText(LoginTextId.LabelPassword);
  const passClasses = passLabel.className.split(" ");
  if (errorId === LoginId.FieldPassword) {
    expect(passClasses).toContain(errorClass);
  } else {
    expect(passClasses).not.toContain(errorClass);
  }

  // Submission check
  if (errorId) {
    expect(mockAsyncLogIn).not.toHaveBeenCalled();
  } else {
    expect(mockAsyncLogIn).toHaveBeenCalled();
  }
};

beforeEach(async () => {
  await renderLogin();
});

describe("Login", () => {
  describe("submit button", () => {
    // Don't test with empty username or password, because those prevent submission.

    it("errors when username is whitespace", async () => {
      await typeInField(LoginTextId.LabelUsername, "    ");
      await typeInField(LoginTextId.LabelPassword, "nonempty");

      await loginAndCheckError(LoginId.FieldUsername);
    });

    it("errors when password is whitespace", async () => {
      await typeInField(LoginTextId.LabelUsername, "nonempty");
      await typeInField(LoginTextId.LabelPassword, "   ");

      await loginAndCheckError(LoginId.FieldPassword);
    });

    it("submits when username and password are valid", async () => {
      await typeInField(LoginTextId.LabelUsername, "nonempty");
      await typeInField(LoginTextId.LabelPassword, "nonempty");

      await loginAndCheckError();
    });
  });
});
