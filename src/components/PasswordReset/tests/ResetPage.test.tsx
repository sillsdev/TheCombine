import "@testing-library/jest-dom";
import {
  type RenderOptions,
  act,
  cleanup,
  render,
  screen,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { type ReactElement, type ReactNode } from "react";
import { Provider } from "react-redux";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import configureMockStore from "redux-mock-store";

import PasswordReset, {
  PasswordResetTestIds,
} from "components/PasswordReset/ResetPage";
import { Path } from "types/path";

const mockPasswordReset = jest.fn();
const mockValidateResetToken = jest.fn();

jest.mock("backend", () => ({
  resetPassword: (...args: any[]) => mockPasswordReset(...args),
  validateResetToken: (...args: any[]) => mockValidateResetToken(...args),
}));

// This test relies on nothing in the store so mock an empty store
const mockStore = configureMockStore()();

const setupMocks = (): void => {
  mockValidateResetToken.mockResolvedValue(true);
};

beforeEach(() => {
  jest.clearAllMocks();
  setupMocks();
});

afterEach(cleanup);

const ResetPageProviders = ({
  children,
}: {
  children: ReactNode;
}): ReactElement => {
  return (
    <Provider store={mockStore}>
      <MemoryRouter initialEntries={[`${Path.PwReset}/testPasswordReset`]}>
        <Routes>
          <Route path={`${Path.PwReset}/:token`} element={children} />
        </Routes>
      </MemoryRouter>
    </Provider>
  );
};

const customRender = async (
  ui: ReactElement,
  options?: Omit<RenderOptions, "wrapper">
): Promise<void> => {
  await act(async () => {
    render(ui, { wrapper: ResetPageProviders, ...options });
  });
};

describe("PasswordReset", () => {
  it("renders with password length error", async () => {
    const user = userEvent.setup();
    await customRender(<PasswordReset />);

    const shortPassword = "foo";
    const passwdField = screen.getByTestId(PasswordResetTestIds.Password);
    const passwdConfirm = screen.getByTestId(
      PasswordResetTestIds.ConfirmPassword
    );

    await user.type(passwdField, shortPassword);
    await user.type(passwdConfirm, shortPassword);

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
    await customRender(<PasswordReset />);

    const passwordEntry = "password";
    const confirmEntry = "passward";
    const passwdField = screen.getByTestId(PasswordResetTestIds.Password);
    const passwdConfirm = screen.getByTestId(
      PasswordResetTestIds.ConfirmPassword
    );

    await user.type(passwdField, passwordEntry);
    await user.type(passwdConfirm, confirmEntry);

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
    await customRender(<PasswordReset />);

    const passwordEntry = "password";
    const confirmEntry = "password";
    const passwdField = screen.getByTestId(PasswordResetTestIds.Password);
    const passwdConfirm = screen.getByTestId(
      PasswordResetTestIds.ConfirmPassword
    );

    await user.type(passwdField, passwordEntry);
    await user.type(passwdConfirm, confirmEntry);

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

  it("renders with expire error", async () => {
    // rerender the component with the resetFailure prop set.
    const user = userEvent.setup();
    await customRender(<PasswordReset />);

    const passwordEntry = "password";
    const confirmEntry = "password";
    const passwdField = screen.getByTestId(PasswordResetTestIds.Password);
    const passwdConfirm = screen.getByTestId(
      PasswordResetTestIds.ConfirmPassword
    );

    await user.type(passwdField, passwordEntry);
    await user.type(passwdConfirm, confirmEntry);

    const submitButton = screen.getByTestId(PasswordResetTestIds.SubmitButton);
    mockPasswordReset.mockResolvedValueOnce(false);
    await user.click(submitButton);

    const resetErrors = screen.queryAllByTestId(
      PasswordResetTestIds.PasswordResetFail
    );
    expect(resetErrors.length).toBeGreaterThan(0);
  });

  it("renders the InvalidLink component if token not valid", async () => {
    mockValidateResetToken.mockResolvedValueOnce(false);
    await customRender(<PasswordReset />);
    for (const id of Object.values(PasswordResetTestIds)) {
      expect(screen.queryAllByTestId(id)).toHaveLength(0);
    }
    // The textId will show up as text because t() is mocked to return its input.
    expect(screen.queryAllByText("passwordReset.invalidURL")).toBeTruthy();
  });
});
