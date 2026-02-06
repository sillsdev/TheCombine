import "@testing-library/jest-dom";
import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import MockCaptcha from "components/Login/tests/MockCaptcha";
import ResetRequest, {
  ResetRequestTextId,
} from "components/PasswordReset/Request";

jest.mock("react-router", () => ({
  useNavigate: jest.fn(),
}));

jest.mock("backend", () => ({
  resetPasswordRequest: (...args: any[]) => mockResetPasswordRequest(...args),
}));
jest.mock("components/Login/Captcha", () => MockCaptcha);

const mockResetPasswordRequest = jest.fn();

const setupMocks = (): void => {
  mockResetPasswordRequest.mockResolvedValue(true);
};

beforeEach(() => {
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
    const login = screen.getByText(ResetRequestTextId.ButtonLogin);
    const submit = screen.getByText(ResetRequestTextId.ButtonSubmit);
    expect(login).toBeEnabled();
    expect(submit).toBeDisabled();

    // Agent
    await agent.type(screen.getByRole("textbox"), "a");

    // After
    expect(login).toBeEnabled();
    expect(submit).toBeEnabled();
  });

  it("after submit, removes text field and submit button", async () => {
    // Setup
    const agent = userEvent.setup();
    await renderUserSettings();

    // Before
    expect(screen.queryByText(ResetRequestTextId.ButtonLogin)).toBeTruthy();
    const submit = screen.getByText(ResetRequestTextId.ButtonSubmit);
    expect(submit).toBeTruthy();

    // Agent
    await agent.type(screen.getByRole("textbox"), "a");
    await agent.click(submit);

    // After
    expect(screen.queryByRole("textbox")).toBeNull();
    expect(screen.queryByText(ResetRequestTextId.ButtonLogin)).toBeTruthy();
    expect(screen.queryByText(ResetRequestTextId.ButtonSubmit)).toBeNull();
  });
});
