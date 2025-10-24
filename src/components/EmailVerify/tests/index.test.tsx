import "@testing-library/jest-dom";
import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router";

import EmailVerify, { EmailVerifyTextId } from "components/EmailVerify";
import { reset } from "rootRedux/actions";
import { Path } from "types/path";

jest.mock("react-router", () => ({
  ...jest.requireActual("react-router"),
  useNavigate:
    () =>
    (...args: any) =>
      mockNavigate(...args),
}));

jest.mock("backend", () => ({
  verifyEmail: (token: string) => mockVerifyEmail(token),
}));
jest.mock("rootRedux/hooks", () => ({
  ...jest.requireActual("rootRedux/hooks"),
  useAppDispatch: () => mockDispatch,
}));

const mockDispatch = jest.fn();
const mockNavigate = jest.fn();
const mockVerifyEmail = jest.fn();

beforeEach(jest.clearAllMocks);

async function renderEmailVerify(): Promise<void> {
  await act(async () => {
    render(
      <MemoryRouter initialEntries={[`${Path.EmailVerify}/test-token`]}>
        <Routes>
          <Route
            path={`${Path.EmailVerify}/:token`}
            element={<EmailVerify />}
          />
        </Routes>
      </MemoryRouter>
    );
  });
}

describe("EmailVerify", () => {
  it("displays verifying text while loading", async () => {
    mockVerifyEmail.mockReturnValueOnce(new Promise(() => {}));
    await renderEmailVerify();
    expect(mockVerifyEmail).toHaveBeenCalledTimes(1);
    expect(screen.getByText(EmailVerifyTextId.TitleVerifying)).toBeTruthy();
    expect(screen.queryByText(EmailVerifyTextId.ButtonReturn)).toBeNull();
    expect(screen.queryByText(EmailVerifyTextId.InvalidLinkBody)).toBeNull();
    expect(screen.queryByText(EmailVerifyTextId.InvalidLinkTitle)).toBeNull();
    expect(screen.queryByText(EmailVerifyTextId.TitleSuccess)).toBeNull();
  });

  it("allows user to click return button after success", async () => {
    mockVerifyEmail.mockResolvedValue(true);
    await renderEmailVerify();
    expect(mockVerifyEmail).toHaveBeenCalledTimes(1);
    expect(mockDispatch).toHaveBeenCalledWith(reset());
    expect(screen.getByText(EmailVerifyTextId.TitleSuccess)).toBeTruthy();
    expect(screen.queryByText(EmailVerifyTextId.InvalidLinkBody)).toBeNull();
    expect(screen.queryByText(EmailVerifyTextId.InvalidLinkTitle)).toBeNull();
    expect(screen.queryByText(EmailVerifyTextId.TitleVerifying)).toBeNull();

    expect(mockNavigate).not.toHaveBeenCalled();
    await userEvent.click(screen.getByText(EmailVerifyTextId.ButtonReturn));
    expect(mockNavigate).toHaveBeenCalledWith(Path.Login);
  });

  it("renders InvalidLink on verification failure", async () => {
    mockVerifyEmail.mockResolvedValue(false);
    await renderEmailVerify();
    expect(mockVerifyEmail).toHaveBeenCalledTimes(1);
    expect(mockDispatch).not.toHaveBeenCalled();
    expect(screen.getByText(EmailVerifyTextId.InvalidLinkBody)).toBeTruthy();
    expect(screen.getByText(EmailVerifyTextId.InvalidLinkTitle)).toBeTruthy();
    expect(screen.queryByText(EmailVerifyTextId.ButtonReturn)).toBeNull();
    expect(screen.queryByText(EmailVerifyTextId.TitleSuccess)).toBeNull();
    expect(screen.queryByText(EmailVerifyTextId.TitleVerifying)).toBeNull();
  });
});
