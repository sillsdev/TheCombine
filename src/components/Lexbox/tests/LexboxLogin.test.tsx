import "@testing-library/jest-dom";
import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import LexboxLogin from "components/Lexbox/LexboxLogin";

jest.mock("backend", () => ({
  getAuthStatus: () => mockGetAuthStatus(),
  getExternalLoginUrl: () => mockGetExternalLoginUrl(),
  logoutCurrentUser: () => mockLogoutCurrentUser(),
}));

const mockGetAuthStatus = jest.fn();
const mockGetExternalLoginUrl = jest.fn();
const mockLogoutCurrentUser = jest.fn();

const testUrl = "not-a-valid-url";

describe("LexboxLogin", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(window, "open").mockImplementation(() => null);
    mockGetExternalLoginUrl.mockResolvedValue(testUrl);
  });

  it("redirects to Lexbox login when logged out", async () => {
    mockGetAuthStatus.mockResolvedValue({ loggedIn: false });

    await act(async () => {
      render(<LexboxLogin />);
    });

    const loginButton = await screen.findByRole("button", { name: /login/i });
    await waitFor(() => expect(mockGetAuthStatus).toHaveBeenCalled());
    await waitFor(() => expect(loginButton).toBeEnabled());

    await userEvent.click(loginButton);

    expect(mockGetExternalLoginUrl).toHaveBeenCalledTimes(1);
    expect(window.open).toHaveBeenCalledWith(testUrl);
  });

  it("shows logged-in menu and logs out", async () => {
    mockGetAuthStatus
      .mockResolvedValueOnce({ loggedIn: true, loggedInAs: "Lex User" })
      .mockResolvedValueOnce({ loggedIn: false });

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

    expect(mockGetExternalLoginUrl).not.toHaveBeenCalled();
    expect(mockLogoutCurrentUser).toHaveBeenCalledTimes(1);
    expect(onStatusChange).toHaveBeenCalledWith("logged-out");
  });
});
