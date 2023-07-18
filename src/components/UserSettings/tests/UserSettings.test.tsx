import "@testing-library/jest-dom";
import { act, cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import "tests/reactI18nextMock";

import { User } from "api/models";
import {
  UserSettings,
  UserSettingsIds,
} from "components/UserSettings/UserSettings";
import { newUser } from "types/user";

const mockIsEmailTaken = jest.fn();
const mockUpdateUser = jest.fn();

jest.mock("notistack", () => ({
  ...jest.requireActual("notistack"),
  enqueueSnackbar: jest.fn(),
}));

jest.mock("backend", () => ({
  isEmailTaken: (...args: any[]) => mockIsEmailTaken(...args),
  updateUser: (...args: any[]) => mockUpdateUser(...args),
}));
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
  mockIsEmailTaken.mockResolvedValue(false);
  mockUpdateUser.mockImplementation((user: User) => user);
};

beforeEach(() => {
  jest.clearAllMocks();
  setupMocks();
});

afterEach(cleanup);

const renderUserSettings = async (user = mockUser()): Promise<void> => {
  await act(async () => {
    render(<UserSettings user={user} />);
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
      await act(async () => {
        await agent.type(field, "?");
      });
      expect(submitButton).toBeEnabled();
      await act(async () => {
        await agent.type(field, "{backspace}");
      });
    };

    await typeAndCheckEnabled(UserSettingsIds.FieldEmail);
    await typeAndCheckEnabled(UserSettingsIds.FieldName);
    await typeAndCheckEnabled(UserSettingsIds.FieldPhone);
  });

  it("updates user when something is changed and submitted", async () => {
    const agent = userEvent.setup();
    await renderUserSettings();

    expect(mockUpdateUser).toBeCalledTimes(0);
    await act(async () => {
      await agent.type(screen.getByTestId(UserSettingsIds.FieldName), "a");
      await agent.click(screen.getByTestId(UserSettingsIds.ButtonSubmit));
    });
    expect(mockUpdateUser).toBeCalledTimes(1);
  });

  it("doesn't update user when email is taken", async () => {
    const agent = userEvent.setup();
    await renderUserSettings(mockUser());

    mockIsEmailTaken.mockResolvedValueOnce(true);
    await act(async () => {
      await agent.type(screen.getByTestId(UserSettingsIds.FieldEmail), "a");
      await agent.click(screen.getByTestId(UserSettingsIds.ButtonSubmit));
    });
    expect(mockUpdateUser).toBeCalledTimes(0);
  });
});
