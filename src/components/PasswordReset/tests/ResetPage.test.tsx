import "@testing-library/jest-dom";
import {
  type RenderOptions,
  act,
  render,
  screen,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { type ReactElement, type ReactNode } from "react";
import { Provider } from "react-redux";
import { MemoryRouter, Route, Routes } from "react-router";
import configureMockStore from "redux-mock-store";

import PasswordReset, {
  PasswordResetTextId,
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
  it("disables button when password too short", async () => {
    const user = userEvent.setup();
    await customRender(<PasswordReset />);

    const shortPassword = "foo";
    const passwdField = screen.getByLabelText(
      PasswordResetTextId.FieldPassword1
    );
    const passwdConfirm = screen.getByLabelText(
      PasswordResetTextId.FieldPassword2
    );

    await user.type(passwdField, shortPassword);
    await user.type(passwdConfirm, shortPassword);

    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("disables button when passwords don't match", async () => {
    const user = userEvent.setup();
    await customRender(<PasswordReset />);

    const passwordEntry = "password";
    const confirmEntry = "passward";
    const passwdField = screen.getByLabelText(
      PasswordResetTextId.FieldPassword1
    );
    const passwdConfirm = screen.getByLabelText(
      PasswordResetTextId.FieldPassword2
    );
    expect(
      screen.queryByText(PasswordResetTextId.FieldPassword2Error)
    ).toBeNull();

    await user.type(passwdField, passwordEntry);
    await user.type(passwdConfirm, confirmEntry);

    expect(screen.getByRole("button")).toBeDisabled();
    expect(
      screen.queryByText(PasswordResetTextId.FieldPassword2Error)
    ).toBeTruthy();
  });

  it("enables button when passwords are long enough and match", async () => {
    const user = userEvent.setup();
    await customRender(<PasswordReset />);

    const passwordEntry = "password";
    const passwdField = screen.getByLabelText(
      PasswordResetTextId.FieldPassword1
    );
    const passwdConfirm = screen.getByLabelText(
      PasswordResetTextId.FieldPassword2
    );

    await user.type(passwdField, passwordEntry);
    await user.type(passwdConfirm, passwordEntry);

    expect(screen.getByRole("button")).toBeEnabled();
  });

  it("renders the InvalidLink component if token not valid", async () => {
    mockValidateResetToken.mockResolvedValueOnce(false);
    await customRender(<PasswordReset />);

    expect(screen.queryByRole("textbox")).toBeNull();
    expect(screen.getByText(PasswordResetTextId.Invalid)).toBeTruthy();
  });
});
