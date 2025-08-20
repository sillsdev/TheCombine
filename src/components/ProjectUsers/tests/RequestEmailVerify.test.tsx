import "@testing-library/jest-dom";
import { render, screen, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { User } from "api/models";
import RequestEmailVerify, {
  RequestEmailVerifyTextId,
} from "components/ProjectUsers/RequestEmailVerify";

const mockIsEmailOkay = jest.fn();
const mockOnCancel = jest.fn();
const mockOnSubmit = jest.fn();
const mockRequestEmailVerify = jest.fn();
const mockUpdateUser = jest.fn();

jest.mock("backend", () => ({
  isEmailOkay: (email: string) => mockIsEmailOkay(email),
  requestEmailVerify: (email: string) => mockRequestEmailVerify(email),
  updateUser: (user: User) => mockUpdateUser(user),
}));
jest.mock("backend/localStorage", () => ({
  getCurrentUser: () => mockUser,
}));

const mockEmail = "user@domain.com";
const mockUser = { id: "u1", email: mockEmail };

beforeEach(() => {
  jest.clearAllMocks();
  mockIsEmailOkay.mockResolvedValue(true);
  mockRequestEmailVerify.mockResolvedValue(undefined);
  mockUpdateUser.mockResolvedValue(undefined);
});

async function renderRequestEmailVerify(): Promise<void> {
  await act(async () => {
    render(
      <RequestEmailVerify onCancel={mockOnCancel} onSubmit={mockOnSubmit} />
    );
  });
}

describe("RequestEmailVerify", () => {
  it("renders with title and current user's email", async () => {
    // Action
    await renderRequestEmailVerify();

    // Results
    expect(screen.getByText(RequestEmailVerifyTextId.Title)).toBeTruthy();
    expect(screen.getByRole("textbox")).toHaveValue(mockEmail);
  });

  it("calls no backend or parent function when new email is typed", async () => {
    // Setup
    await renderRequestEmailVerify();
    const emailField = screen.getByRole("textbox");

    // Action
    await userEvent.clear(emailField);
    await userEvent.type(emailField, "new@domain.com");

    // Non-results
    expect(mockIsEmailOkay).not.toHaveBeenCalled();
    expect(mockUpdateUser).not.toHaveBeenCalled();
    expect(mockRequestEmailVerify).not.toHaveBeenCalled();
    expect(mockOnSubmit).not.toHaveBeenCalled();
    expect(mockOnCancel).not.toHaveBeenCalled();
  });

  it("disables submit for invalid email", async () => {
    // Setup
    await renderRequestEmailVerify();
    const emailField = screen.getByRole("textbox");

    // Action
    await userEvent.clear(emailField);
    await userEvent.type(emailField, "invalid-email");

    // Results
    expect(
      screen.getByText(RequestEmailVerifyTextId.ButtonCancel)
    ).toBeEnabled();
    expect(
      screen.getByText(RequestEmailVerifyTextId.ButtonSubmit)
    ).toBeDisabled();
  });

  it("shows error if email not okay", async () => {
    // Setup
    mockIsEmailOkay.mockResolvedValue(false);
    await renderRequestEmailVerify();
    expect(
      screen.queryByText(RequestEmailVerifyTextId.FieldEmailTaken)
    ).toBeNull();

    // Action
    await userEvent.click(
      screen.getByText(RequestEmailVerifyTextId.ButtonSubmit)
    );

    // Results
    expect(
      screen.getByText(RequestEmailVerifyTextId.FieldEmailTaken)
    ).toBeTruthy();
    expect(mockIsEmailOkay).toHaveBeenCalledWith(mockEmail);

    // Non-results
    expect(mockUpdateUser).not.toHaveBeenCalled();
    expect(mockRequestEmailVerify).not.toHaveBeenCalled();
    expect(mockOnSubmit).not.toHaveBeenCalled();
    expect(mockOnCancel).not.toHaveBeenCalled();
  });

  it("submits without user update if email okay and unchanged", async () => {
    // Setup
    await renderRequestEmailVerify();

    // Action
    await userEvent.click(
      screen.getByText(RequestEmailVerifyTextId.ButtonSubmit)
    );

    // Results
    expect(mockIsEmailOkay).toHaveBeenCalledWith(mockEmail);
    expect(mockRequestEmailVerify).toHaveBeenCalledWith(mockEmail);
    expect(mockOnSubmit).toHaveBeenCalledTimes(1);

    // Non-results
    expect(
      screen.queryByText(RequestEmailVerifyTextId.FieldEmailTaken)
    ).toBeNull();
    expect(mockUpdateUser).not.toHaveBeenCalled();
    expect(mockOnCancel).not.toHaveBeenCalled();
  });

  it("submits with user update if email okay and changed", async () => {
    // Setup
    await renderRequestEmailVerify();
    const differentEmail = "new@domain.com";
    const emailField = screen.getByRole("textbox");

    // Action
    await userEvent.clear(emailField);
    await userEvent.type(emailField, differentEmail);
    await userEvent.click(
      screen.getByText(RequestEmailVerifyTextId.ButtonSubmit)
    );

    // Results
    expect(mockIsEmailOkay).toHaveBeenCalledWith(differentEmail);
    expect(mockUpdateUser).toHaveBeenCalledWith({
      ...mockUser,
      email: differentEmail,
    });
    expect(mockRequestEmailVerify).toHaveBeenCalledWith(differentEmail);
    expect(mockOnSubmit).toHaveBeenCalledTimes(1);

    // Non-results
    expect(
      screen.queryByText(RequestEmailVerifyTextId.FieldEmailTaken)
    ).toBeNull();
    expect(mockOnCancel).not.toHaveBeenCalled();
  });

  it("cancels when cancel button is clicked", async () => {
    // Setup
    await renderRequestEmailVerify();

    // Action
    await userEvent.click(
      screen.getByText(RequestEmailVerifyTextId.ButtonCancel)
    );

    // Results
    expect(mockOnCancel).toHaveBeenCalledTimes(1);

    // Non-results
    expect(mockIsEmailOkay).not.toHaveBeenCalled();
    expect(mockUpdateUser).not.toHaveBeenCalled();
    expect(mockRequestEmailVerify).not.toHaveBeenCalled();
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });
});
