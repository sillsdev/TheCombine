import "@testing-library/jest-dom";
import { act, cleanup, render, screen } from "@testing-library/react";
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

afterEach(cleanup);

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
    const button = screen.getByRole("button");
    expect(button).toBeDisabled();

    // Agent
    const field = screen.getByTestId(PasswordRequestIds.FieldEmailOrUsername);
    await agent.type(field, "a");

    // After
    expect(button).toBeEnabled();
  });

  it("after submit, removes text field and submit button and reveals login button", async () => {
    // Setup
    const agent = userEvent.setup();
    await renderUserSettings();

    // Before
    expect(
      screen.queryByTestId(PasswordRequestIds.FieldEmailOrUsername)
    ).toBeTruthy();
    expect(screen.queryByTestId(PasswordRequestIds.ButtonSubmit)).toBeTruthy();
    expect(screen.queryByTestId(PasswordRequestIds.ButtonLogin)).toBeNull();

    // Agent
    const field = screen.getByTestId(PasswordRequestIds.FieldEmailOrUsername);
    await agent.type(field, "a");
    await agent.click(screen.getByRole("button"));

    // After
    expect(
      screen.queryByTestId(PasswordRequestIds.FieldEmailOrUsername)
    ).toBeNull();
    expect(screen.queryByTestId(PasswordRequestIds.ButtonSubmit)).toBeNull();
    expect(screen.queryByTestId(PasswordRequestIds.ButtonLogin)).toBeTruthy();
  });
});
