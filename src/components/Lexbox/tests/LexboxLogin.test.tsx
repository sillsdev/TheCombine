import "@testing-library/jest-dom";
import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import LexboxLogin from "components/Lexbox/LexboxLogin";

jest.mock("backend", () => ({
  getLexboxAuthStatus: () => mockGetLexboxAuthStatus(),
  getLexboxLoginUrl: (switchAccount?: boolean) =>
    mockGetLexboxLoginUrl(switchAccount),
  logoutLexboxUser: () => mockLogoutLexboxUser(),
}));

const mockGetLexboxAuthStatus = jest.fn();
const mockGetLexboxLoginUrl = jest.fn();
const mockLogoutLexboxUser = jest.fn();

const testUrl = "not-a-valid-url";

let mockLoginWindow: { close: jest.Mock; location: { href: string } };

/** Stands in for BroadcastChannel, which jsdom lacks. */
class MockBroadcastChannel {
  static instances: MockBroadcastChannel[] = [];
  onmessage: (() => void) | null = null;
  close = jest.fn();
  constructor() {
    MockBroadcastChannel.instances.push(this);
  }
}

describe("LexboxLogin", () => {
  beforeAll(() => {
    Object.assign(globalThis, { BroadcastChannel: MockBroadcastChannel });
  });

  afterAll(() => {
    Reflect.deleteProperty(globalThis, "BroadcastChannel");
  });

  beforeEach(() => {
    jest.clearAllMocks();
    MockBroadcastChannel.instances = [];
    mockLoginWindow = { close: jest.fn(), location: { href: "" } };
    jest
      .spyOn(window, "open")
      .mockImplementation(() => mockLoginWindow as unknown as Window);
    mockGetLexboxLoginUrl.mockResolvedValue(testUrl);
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

    expect(window.open).toHaveBeenCalledWith("", "_blank");
    expect(mockGetLexboxLoginUrl).toHaveBeenCalledWith(false);
    await waitFor(() => expect(mockLoginWindow.location.href).toEqual(testUrl));
  });

  it("closes the login window when the login url can't be fetched", async () => {
    const consoleError = jest.spyOn(console, "error").mockImplementation();
    mockGetLexboxAuthStatus.mockResolvedValue({ isLoggedIn: false });
    mockGetLexboxLoginUrl.mockRejectedValue(new Error("Ticket failed."));

    await act(async () => {
      render(<LexboxLogin />);
    });
    const loginButton = await screen.findByRole("button", { name: /login/i });
    await waitFor(() => expect(loginButton).toBeEnabled());

    await userEvent.click(loginButton);

    await waitFor(() => expect(mockLoginWindow.close).toHaveBeenCalled());
    expect(consoleError).toHaveBeenCalled();
    consoleError.mockRestore();
  });

  it("switches account from the logged-in menu", async () => {
    mockGetLexboxAuthStatus.mockResolvedValue({
      isLoggedIn: true,
      loggedInAs: "Lex User",
    });

    await act(async () => {
      render(<LexboxLogin />);
    });
    await userEvent.click(
      await screen.findByRole("button", { name: "Lex User" })
    );
    await userEvent.click(
      await screen.findByRole("menuitem", { name: /switch/i })
    );

    expect(mockGetLexboxLoginUrl).toHaveBeenCalledWith(true);
    await waitFor(() => expect(mockLoginWindow.location.href).toEqual(testUrl));
  });

  it("falls back to logged out when the status request fails", async () => {
    const consoleError = jest.spyOn(console, "error").mockImplementation();
    mockGetLexboxAuthStatus.mockRejectedValue(new Error("Status failed."));

    const onStatusChange = jest.fn();

    await act(async () => {
      render(<LexboxLogin onStatusChange={onStatusChange} />);
    });

    const loginButton = await screen.findByRole("button", { name: /login/i });
    await waitFor(() => expect(loginButton).toBeEnabled());

    expect(consoleError).toHaveBeenCalled();
    expect(onStatusChange).toHaveBeenCalledWith(false);
    expect(onStatusChange).not.toHaveBeenCalledWith(true);
    consoleError.mockRestore();
  });

  it("refreshes status when the window regains focus", async () => {
    mockGetLexboxAuthStatus
      .mockResolvedValueOnce({ isLoggedIn: false })
      .mockResolvedValueOnce({ isLoggedIn: true, loggedInAs: "Lex User" });

    await act(async () => {
      render(<LexboxLogin />);
    });
    await screen.findByRole("button", { name: /login/i });

    await act(async () => {
      window.dispatchEvent(new Event("focus"));
    });

    expect(
      await screen.findByRole("button", { name: "Lex User" })
    ).toBeInTheDocument();
  });

  it("refreshes status when another window reports a login", async () => {
    mockGetLexboxAuthStatus
      .mockResolvedValueOnce({ isLoggedIn: false })
      .mockResolvedValueOnce({ isLoggedIn: true, loggedInAs: "Lex User" });

    const { unmount } = render(<LexboxLogin />);
    await screen.findByRole("button", { name: /login/i });
    expect(MockBroadcastChannel.instances).toHaveLength(1);

    await act(async () => {
      MockBroadcastChannel.instances[0].onmessage?.();
    });

    expect(
      await screen.findByRole("button", { name: "Lex User" })
    ).toBeInTheDocument();

    unmount();
    expect(MockBroadcastChannel.instances[0].close).toHaveBeenCalled();
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
