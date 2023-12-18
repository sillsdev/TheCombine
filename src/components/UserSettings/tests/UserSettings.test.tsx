import "@testing-library/jest-dom";
import { act, cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import "tests/reactI18nextMock";

import { User } from "api/models";
import UserSettingsGetUser, {
  UserSettings,
  UserSettingsIds,
} from "components/UserSettings/UserSettings";
import { newUser } from "types/user";

const mockGetAvatar = jest.fn();
const mockGetCurrentUser = jest.fn();
const mockIsEmailTaken = jest.fn();
const mockSetUser = jest.fn();
const mockUpdateUser = jest.fn();

jest.mock("notistack", () => ({
  ...jest.requireActual("notistack"),
  enqueueSnackbar: jest.fn(),
}));

jest.mock("backend", () => ({
  isEmailTaken: (...args: any[]) => mockIsEmailTaken(...args),
  updateUser: (...args: any[]) => mockUpdateUser(...args),
}));
jest.mock("backend/localStorage", () => ({
  getAvatar: (...args: any[]) => mockGetAvatar(...args),
  getCurrentUser: (...args: any[]) => mockGetCurrentUser(...args),
}));

// Mock "i18n", else `thrown: "Error: Error: connect ECONNREFUSED ::1:80 [...]`
jest.mock("i18n", () => ({
  updateLangFromUser: jest.fn(),
}));

const mockUser = (): User => {
  const user = newUser("My Name", "my-username");
  user.email = "e@mail.com";
  user.phone = "123-456-7890";
  user.uiLang = "fr";
  return user;
};

const setupMocks = (): void => {
  mockGetAvatar.mockReturnValue("");
  mockGetCurrentUser.mockReturnValue(mockUser());
  mockIsEmailTaken.mockResolvedValue(false);
  mockSetUser.mockImplementation(async () => {});
  mockUpdateUser.mockImplementation((user: User) => user);
};

beforeEach(() => {
  jest.clearAllMocks();
  setupMocks();
});

afterEach(cleanup);

const renderUserSettings = async (user = mockUser()): Promise<void> => {
  await act(async () => {
    render(<UserSettings user={user} setUser={mockSetUser} />);
  });
};

const renderUserSettingsGetUser = async (): Promise<void> => {
  await act(async () => {
    render(<UserSettingsGetUser />);
  });
};

describe("UserSettings", () => {
  it("renders with user info", async () => {
    const user = mockUser();
    await renderUserSettings(user);

    const emailField = screen.getByTestId(UserSettingsIds.FieldEmail);
    expect(emailField).toHaveValue(user.email);
    const nameField = screen.getByTestId(UserSettingsIds.FieldName);
    expect(nameField).toHaveValue(user.name);
    const phoneField = screen.getByTestId(UserSettingsIds.FieldPhone);
    expect(phoneField).toHaveValue(user.phone);
  });

  it("disables button until something is changed", async () => {
    const agent = userEvent.setup();
    await renderUserSettings();

    const submitButton = screen.getByTestId(UserSettingsIds.ButtonSubmit);

    const typeAndCheckEnabled = async (id: UserSettingsIds): Promise<void> => {
      expect(submitButton).toBeDisabled();
      const field = screen.getByTestId(id);
      await agent.type(field, "?");
      expect(submitButton).toBeEnabled();
      await agent.type(field, "{backspace}");
    };

    await typeAndCheckEnabled(UserSettingsIds.FieldEmail);
    await typeAndCheckEnabled(UserSettingsIds.FieldName);
    await typeAndCheckEnabled(UserSettingsIds.FieldPhone);
  });

  it("disables button when change is saved", async () => {
    const agent = userEvent.setup();
    const stringToType = "?";
    const user = mockUser();
    await renderUserSettingsGetUser();
    const submitButton = screen.getByTestId(UserSettingsIds.ButtonSubmit);

    const typeAndCheckEnabled = async (id: UserSettingsIds): Promise<void> => {
      expect(submitButton).toBeDisabled();
      await agent.type(screen.getByTestId(id), stringToType);
      expect(submitButton).toBeEnabled();
      await agent.click(submitButton);
      expect(submitButton).toBeDisabled();
    };

    user.email += stringToType;
    mockGetCurrentUser.mockReturnValueOnce({ ...user });
    await typeAndCheckEnabled(UserSettingsIds.FieldEmail);

    user.name += stringToType;
    mockGetCurrentUser.mockReturnValueOnce({ ...user });
    await typeAndCheckEnabled(UserSettingsIds.FieldName);

    user.phone += stringToType;
    mockGetCurrentUser.mockReturnValueOnce({ ...user });
    await typeAndCheckEnabled(UserSettingsIds.FieldPhone);
  });

  it("updates user when something is changed and submitted", async () => {
    const agent = userEvent.setup();
    await renderUserSettings();

    await agent.type(screen.getByTestId(UserSettingsIds.FieldName), "a");
    expect(mockUpdateUser).toHaveBeenCalledTimes(0);
    await agent.click(screen.getByTestId(UserSettingsIds.ButtonSubmit));
    expect(mockUpdateUser).toHaveBeenCalledTimes(1);
  });

  it("doesn't update user when email is taken", async () => {
    const agent = userEvent.setup();
    await renderUserSettings(mockUser());

    await agent.type(screen.getByTestId(UserSettingsIds.FieldEmail), "a");
    mockIsEmailTaken.mockResolvedValueOnce(true);
    await agent.click(screen.getByTestId(UserSettingsIds.ButtonSubmit));
    expect(mockUpdateUser).toHaveBeenCalledTimes(0);
  });
});
