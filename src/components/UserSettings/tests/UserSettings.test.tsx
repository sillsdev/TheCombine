import "@testing-library/jest-dom";
import { act, cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import configureMockStore from "redux-mock-store";

import "tests/reactI18nextMock";

import { User } from "api/models";
import {
  UserSettings,
  UserSettingsIds,
} from "components/UserSettings/UserSettings";
import { newUser } from "types/user";

const mockIsEmailTaken = jest.fn();
const mockToUnicode = jest.fn();
const mockUpdateUser = jest.fn();

jest.mock("notistack", () => ({
  ...jest.requireActual("notistack"),
  enqueueSnackbar: jest.fn(),
}));
jest.mock("punycode/", () => ({
  toUnicode: (...args: any[]) => mockToUnicode(...args),
}));

jest.mock("backend", () => ({
  isEmailTaken: (...args: any[]) => mockIsEmailTaken(...args),
  updateUser: (...args: any[]) => mockUpdateUser(...args),
}));
jest.mock("backend/localStorage");

const mockStore = configureMockStore()();
const mockUser = (): User => {
  const user = newUser("My Name", "my-username");
  user.email = "e@mail.com";
  user.phone = "123-456-7890";
  user.uiLang = "fr";
  return user;
};

const setupMocks = (): void => {
  mockToUnicode.mockImplementation((text: string) => text);
  mockIsEmailTaken.mockResolvedValue(false);
};

beforeEach(() => {
  jest.clearAllMocks();
  setupMocks();
});

afterEach(cleanup);

const renderUserSettings = async (user = newUser()): Promise<void> => {
  await act(async () => {
    render(
      <Provider store={mockStore}>
        <UserSettings user={user} />
      </Provider>
    );
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
    const user = mockUser();
    const agent = userEvent.setup();
    await renderUserSettings(user);

    const submitButton = screen.getByTestId(UserSettingsIds.ButtonSubmit);
    expect(submitButton).toBeDisabled();

    const nameField = screen.getByTestId(UserSettingsIds.FieldName);
    // This act() is triggering `thrown: "Error: Error: connect ECONNREFUSED ::1:80`
    await act(async () => {
      await agent.type(nameField, "different-username");
    });
    expect(submitButton).toBeEnabled();
  });
});
