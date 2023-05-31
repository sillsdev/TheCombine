import "@testing-library/jest-dom";
import {
  act,
  cleanup,
  render,
  RenderOptions,
  screen,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ReactElement } from "react";
import { Provider } from "react-redux";
import { MemoryRouter, Route, Switch } from "react-router-dom";
import configureMockStore from "redux-mock-store";

import { Path } from "browserHistory";
import "tests/reactI18nextMock";
import {
  PasswordReset,
  PasswordResetTestIds,
} from "components/PasswordReset/ResetPage";

const mockPasswordReset = jest.fn((token: string, newPassword: string) => {
  if (token === "resetSuccess") {
    return Promise.resolve();
  } else {
    return Promise.reject();
  }
});

jest.mock("backend", () => ({
  resetPassword: (token: string, newPassword: string) =>
    mockPasswordReset(token, newPassword),
}));

// This test relies on nothing in the store so mock an empty store
const mockStore = configureMockStore([])();

beforeEach(() => {
  jest.clearAllMocks();
});

afterEach(cleanup);

const ResetPageProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <Provider store={mockStore}>
      <MemoryRouter initialEntries={[`/forgot/reset/testPasswordReset`]}>
        <Switch>
          <Route path={`${Path.PwReset}/:token`}>{children}</Route>
        </Switch>
      </MemoryRouter>
    </Provider>
  );
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, "wrapper">
) => render(ui, { wrapper: ResetPageProviders, ...options });

describe("PasswordReset", () => {
  it("renders with password length error", async () => {
    const user = userEvent.setup();
    customRender(<PasswordReset />);

    const shortPassword = "foo";
    const passwdField = screen.getByTestId(PasswordResetTestIds.Password);
    const passwdConfirm = screen.getByTestId(
      PasswordResetTestIds.ConfirmPassword
    );

    if (passwdField && passwdConfirm) {
      await user.type(passwdField, shortPassword);
      await user.type(passwdConfirm, shortPassword);
    }
    const reqErrors = screen.queryAllByTestId(
      PasswordResetTestIds.PasswordReqError
    );
    const confirmErrors = screen.queryAllByTestId(
      PasswordResetTestIds.PasswordMatchError
    );
    const submitButton = screen.getByTestId(PasswordResetTestIds.SubmitButton);

    expect(reqErrors.length).toBeGreaterThan(0);
    expect(confirmErrors.length).toBe(0);
    expect(submitButton.closest("button")).toBeDisabled();
  });

  it("renders with password match error", async () => {
    const user = userEvent.setup();
    customRender(<PasswordReset />);

    const passwordEntry = "password";
    const confirmEntry = "passward";
    const passwdField = screen.getByTestId(PasswordResetTestIds.Password);
    const passwdConfirm = screen.getByTestId(
      PasswordResetTestIds.ConfirmPassword
    );
    if (passwdField && passwdConfirm) {
      await user.type(passwdField, passwordEntry);
      await user.type(passwdConfirm, confirmEntry);
    }

    const reqErrors = screen.queryAllByTestId(
      PasswordResetTestIds.PasswordReqError
    );
    const confirmErrors = screen.queryAllByTestId(
      PasswordResetTestIds.PasswordMatchError
    );
    const submitButton = screen.getByTestId(PasswordResetTestIds.SubmitButton);

    expect(reqErrors.length).toBe(0);
    expect(confirmErrors.length).toBeGreaterThan(0);
    expect(submitButton.closest("button")).toBeDisabled();
  });

  it("renders with no password errors", async () => {
    const user = userEvent.setup();
    // act(() => {
    customRender(<PasswordReset />);
    // });

    const passwordEntry = "password";
    const confirmEntry = "password";
    const passwdField = screen.getByTestId(PasswordResetTestIds.Password);
    const passwdConfirm = screen.getByTestId(
      PasswordResetTestIds.ConfirmPassword
    );
    if (passwdField && passwdConfirm) {
      await user.type(passwdField, passwordEntry);
      await user.type(passwdConfirm, confirmEntry);
    }

    const reqErrors = screen.queryAllByTestId(
      PasswordResetTestIds.PasswordReqError
    );
    const confirmErrors = screen.queryAllByTestId(
      PasswordResetTestIds.PasswordMatchError
    );
    const submitButton = screen.getByTestId(PasswordResetTestIds.SubmitButton);

    expect(reqErrors.length).toBe(0);
    expect(confirmErrors.length).toBe(0);
    expect(submitButton.closest("button")).toBeEnabled();
  });

  // ------------------------------------------------------------

  it("renders with expire error", async () => {
    await act(async () => {
      // rerender the component with the resetFailure prop set.
      const user = userEvent.setup();
      customRender(<PasswordReset />);

      const passwordEntry = "password";
      const confirmEntry = "password";
      const passwdField = screen.getByTestId(PasswordResetTestIds.Password);
      const passwdConfirm = screen.getByTestId(
        PasswordResetTestIds.ConfirmPassword
      );
      if (passwdField && passwdConfirm) {
        await user.type(passwdField, passwordEntry);
        await user.type(passwdConfirm, confirmEntry);
      }

      const submitButton = screen.getByTestId(
        PasswordResetTestIds.SubmitButton
      );
      await user.click(submitButton);
    });
    const resetErrors = screen.queryAllByTestId(
      PasswordResetTestIds.PasswordResetFail
    );
    expect(resetErrors.length).toBeGreaterThan(0);
  });
});
