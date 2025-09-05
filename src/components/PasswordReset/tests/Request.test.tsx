import "@testing-library/jest-dom";
import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import MockBypassLoadableButton from "components/Buttons/LoadingDoneButton";
import MockCaptcha from "components/Login/tests/MockCaptcha";
import ResetRequest, {
  PasswordRequestIds,
} from "components/PasswordReset/Request";

jest.mock("react-router", () => ({
  useNavigate: jest.fn(),
}));

jest.mock("backend", () => ({
  resetPasswordRequest: (...args: any[]) => mockResetPasswordRequest(...args),
}));
jest.mock("components/Buttons", () => ({
  LoadingDoneButton: MockBypassLoadableButton,
}));
jest.mock("components/Login/Captcha", () => MockCaptcha);

const mockResetPasswordRequest = jest.fn();

const setupMocks = (): void => {
  mockResetPasswordRequest.mockResolvedValue(true);
};

beforeEach(() => {
  jest.clearAllMocks();
  setupMocks();
});

const renderUserSettings = async (): Promise<void> => {
  await act(async () => {
    render(<ResetRequest />);
  });
};

describe("ResetRequest", () => {
  it("has disabled submit button until something is typed", async () => {
    // Setup
    const agent = userEvent.setup();
    await renderUserSettings();

    // Before
    const login = screen.getByTestId(PasswordRequestIds.ButtonLogin);
    const submit = screen.getByTestId(PasswordRequestIds.ButtonSubmit);
    expect(login).toBeEnabled();
    expect(submit).toBeDisabled();

    // Agent
    const field = screen.getByTestId(PasswordRequestIds.FieldEmailOrUsername);
    await agent.type(field, "a");

    // After
    expect(login).toBeEnabled();
    expect(submit).toBeEnabled();
  });

  it("after submit, removes text field and submit button", async () => {
    // Setup
    const agent = userEvent.setup();
    await renderUserSettings();

    // Before
    expect(
      screen.queryByTestId(PasswordRequestIds.FieldEmailOrUsername)
    ).toBeTruthy();
    expect(screen.queryByTestId(PasswordRequestIds.ButtonLogin)).toBeTruthy();
    expect(screen.queryByTestId(PasswordRequestIds.ButtonSubmit)).toBeTruthy();

    // Agent
    const field = screen.getByTestId(PasswordRequestIds.FieldEmailOrUsername);
    await agent.type(field, "a");
    await agent.click(screen.getByTestId(PasswordRequestIds.ButtonSubmit));

    // After
    expect(
      screen.queryByTestId(PasswordRequestIds.FieldEmailOrUsername)
    ).toBeNull();
    expect(screen.queryByTestId(PasswordRequestIds.ButtonLogin)).toBeTruthy();
    expect(screen.queryByTestId(PasswordRequestIds.ButtonSubmit)).toBeNull();
  });
});
