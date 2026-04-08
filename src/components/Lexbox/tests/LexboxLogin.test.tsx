import "@testing-library/jest-dom";
import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import LexboxLogin from "components/Lexbox/LexboxLogin";

jest.mock("backend", () => ({
  getLexboxAuthStatus: () => mockGetLexboxAuthStatus(),
  getLexboxLoginUrl: () => mockGetLexboxLoginUrl(),
  logoutLexboxUser: () => mockLogoutLexboxUser(),
}));

const mockGetLexboxAuthStatus = jest.fn();
const mockGetLexboxLoginUrl = jest.fn();
const mockLogoutLexboxUser = jest.fn();

const testUrl = "not-a-valid-url";

describe("LexboxLogin", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(window, "open").mockImplementation(() => null);
    mockGetLexboxLoginUrl.mockReturnValue(testUrl);
  });

  it("redirects to Lexbox login when logged out", async () => {
    mockGetLexboxAuthStatus.mockResolvedValue({ isLoggedIn: false });

    await act(async () => {
      render(<LexboxLogin />);
    });

    const loginButton = await screen.findByRole("button", { name: /login/i });
    await waitFor(() => expect(mockGetLexboxAuthStatus).toHaveBeenCalled());
    await waitFor(() => expect(loginButton).toBeEnabled());

    await userEvent.click(loginButton);

    expect(mockGetLexboxLoginUrl).toHaveBeenCalledTimes(1);
    expect(window.open).toHaveBeenCalledWith(testUrl);
  });

  it("shows logged-in menu and logs out", async () => {
    mockGetLexboxAuthStatus
      .mockResolvedValueOnce({ isLoggedIn: true, loggedInAs: "Lex User" })
      .mockResolvedValueOnce({ isLoggedIn: false });

    const onStatusChange = jest.fn();

    await act(async () => {
      render(<LexboxLogin onStatusChange={onStatusChange} />);
    });

    const userButton = await screen.findByRole("button", {
      name: "Lex User",
    });

    await userEvent.click(userButton);

    const logoutItem = await screen.findByRole("menuitem", { name: /logout/i });

    await userEvent.click(logoutItem);

    expect(mockGetLexboxLoginUrl).not.toHaveBeenCalled();
    expect(mockLogoutLexboxUser).toHaveBeenCalledTimes(1);
    expect(onStatusChange).toHaveBeenCalledWith(false);
  });
});
