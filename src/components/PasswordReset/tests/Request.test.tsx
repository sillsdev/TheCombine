import "@testing-library/jest-dom";
import { act, cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import ResetRequest, {
  PasswordRequestIds,
} from "components/PasswordReset/Request";

jest.mock("react-router-dom", () => ({
  useNavigate: jest.fn(),
}));

jest.mock("backend", () => ({
  resetPasswordRequest: (...args: any[]) => mockResetPasswordRequest(...args),
}));

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
    expect(screen.queryAllByRole("textbox")).toHaveLength(1);
    expect(screen.queryAllByRole("button")).toHaveLength(1);
    expect(screen.queryByTestId(PasswordRequestIds.ButtonLogin)).toBeNull();

    // Agent
    const field = screen.getByTestId(PasswordRequestIds.FieldEmailOrUsername);
    await agent.type(field, "a");
    await agent.click(screen.getByRole("button"));

    // After
    expect(screen.queryAllByRole("textbox")).toHaveLength(0);
    expect(screen.queryAllByRole("button")).toHaveLength(1);
    expect(screen.queryByTestId(PasswordRequestIds.ButtonLogin)).toBeTruthy();
  });
});
