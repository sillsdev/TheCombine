import "@testing-library/jest-dom";
import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import MockBypassLoadableButton from "components/Buttons/LoadingDoneButton";
import EmailInvite, {
  EmailInviteTextId,
} from "components/ProjectUsers/EmailInvite";

jest.mock("backend", () => ({
  emailInviteToProject: () => mockEmailInviteToProject(),
  getUserIdByEmailOrUsername: () => Promise.resolve("mockUserId"),
  isEmailOrUsernameAvailable: (emailOrUsername: string) =>
    mockIsEmailOrUsernameAvailable(emailOrUsername),
}));
jest.mock("backend/localStorage", () => ({
  getProjectId: () => "mockId",
}));
jest.mock("components/Buttons", () => ({
  LoadingDoneButton: MockBypassLoadableButton,
}));

const mockAddToProject = jest.fn();
const mockClose = jest.fn();
const mockEmailInviteToProject = jest.fn();
const mockIsEmailOrUsernameAvailable = jest.fn();

describe("EmailInvite", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    act(() => {
      render(<EmailInvite addToProject={mockAddToProject} close={mockClose} />);
    });
  });

  const typeEmail = async (email: string): Promise<void> =>
    await userEvent.type(
      screen.getByText(EmailInviteTextId.TextFieldEmail),
      email
    );

  it("has disabled button with invalid email", async () => {
    const button = screen.getByText(EmailInviteTextId.ButtonSubmit);
    expect(button).toBeDisabled();

    await typeEmail("not-valid@4");
    expect(button).toBeDisabled();
  });

  it("has enabled button with valid email", async () => {
    const button = screen.getByText(EmailInviteTextId.ButtonSubmit);
    expect(button).toBeDisabled();

    await typeEmail("valid@e.mail");
    expect(button).toBeEnabled();
  });

  it("closes after submit", async () => {
    await typeEmail("valid@e.mail");
    expect(mockClose).not.toHaveBeenCalled();
    await userEvent.click(screen.getByText(EmailInviteTextId.ButtonSubmit));
    expect(mockClose).toHaveBeenCalledTimes(1);
  });

  it("adds user if already exists", async () => {
    mockIsEmailOrUsernameAvailable.mockResolvedValueOnce(false);
    await typeEmail("valid@e.mail");
    await userEvent.click(screen.getByText(EmailInviteTextId.ButtonSubmit));
    expect(mockAddToProject).toHaveBeenCalledTimes(1);
    expect(mockEmailInviteToProject).not.toHaveBeenCalled();
  });

  it("invite user if doesn't exists", async () => {
    mockIsEmailOrUsernameAvailable.mockResolvedValueOnce(true);
    await typeEmail("valid@e.mail");
    await userEvent.click(screen.getByText(EmailInviteTextId.ButtonSubmit));
    expect(mockAddToProject).not.toHaveBeenCalled();
    expect(mockEmailInviteToProject).toHaveBeenCalledTimes(1);
  });
});
