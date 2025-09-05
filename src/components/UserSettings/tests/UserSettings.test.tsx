import "@testing-library/jest-dom";
import { act, Matcher, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { User } from "api/models";
import UserSettingsGetUser, {
  UserSettings,
  UserSettingsTextId,
} from "components/UserSettings/UserSettings";
import { newUser } from "types/user";

const mockEmailServiceEnabled = jest.fn();
const mockGetAvatar = jest.fn();
const mockGetCurrentUser = jest.fn();
const mockIsEmailOkay = jest.fn();
const mockIsOffline = jest.fn();
const mockRequestEmailVerify = jest.fn();
const mockSetUser = jest.fn();
const mockUpdateUser = jest.fn();

jest.mock("backend", () => ({
  isEmailOkay: (emailOrUsername: string) => mockIsEmailOkay(emailOrUsername),
  requestEmailVerify: (email: string) => mockRequestEmailVerify(email),
  updateUser: (user: User) => mockUpdateUser(user),
}));
jest.mock("backend/localStorage", () => ({
  getAvatar: () => mockGetAvatar(),
  getCurrentUser: () => mockGetCurrentUser(),
}));
jest.mock("components/Project/ProjectActions", () => ({
  asyncLoadSemanticDomains: jest.fn(),
}));
jest.mock("rootRedux/hooks", () => ({
  useAppDispatch: () => jest.fn(),
  useAppSelector: () => undefined,
}));
jest.mock("types/runtimeConfig", () => ({
  RuntimeConfig: {
    getInstance: () => ({
      emailServicesEnabled: mockEmailServiceEnabled,
      isOffline: mockIsOffline,
    }),
  },
}));

// Mock "i18n", else `thrown: "Error: Error: connect ECONNREFUSED ::1:80 [...]`
jest.mock("i18n", () => ({
  updateLangFromUser: jest.fn(),
}));

const mockUserId = "mock-user-id";
const mockUser = (): User => {
  const user = newUser("My Name", "my-username");
  user.email = "e@mail.com";
  user.id = mockUserId;
  user.phone = "123-456-7890";
  user.uiLang = "fr";
  return user;
};

const setupMocks = (): void => {
  mockGetAvatar.mockReturnValue("");
  mockGetCurrentUser.mockReturnValue(mockUser());
  mockIsEmailOkay.mockResolvedValue(true);
  mockSetUser.mockImplementation(async () => {});
  mockUpdateUser.mockImplementation((user: User) => user);
};

beforeEach(() => {
  jest.clearAllMocks();
  setupMocks();
});

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

// Use regex for label matching to allow the * on a required field.
const emailLabelRegEx = new RegExp(UserSettingsTextId.FieldEmail);
const nameLabelRegEx = new RegExp(UserSettingsTextId.FieldName);
const phoneLabelRegEx = new RegExp(UserSettingsTextId.FieldPhone);

describe("UserSettings", () => {
  it("renders with user info", async () => {
    const user = mockUser();
    await renderUserSettings(user);

    expect(screen.getByLabelText(emailLabelRegEx)).toHaveValue(user.email);
    expect(screen.getByLabelText(nameLabelRegEx)).toHaveValue(user.name);
    expect(screen.getByLabelText(phoneLabelRegEx)).toHaveValue(user.phone);
  });

  it("disables button until something is changed", async () => {
    const agent = userEvent.setup();
    await renderUserSettings();
    const submitButton = screen.getByText(UserSettingsTextId.ButtonSubmit);

    const typeAndCheckAndDelete = async (label: Matcher): Promise<void> => {
      expect(submitButton).toBeDisabled();
      const field = screen.getByLabelText(label);
      await agent.type(field, "?");
      expect(submitButton).toBeEnabled();
      await agent.type(field, "{backspace}");
    };

    await typeAndCheckAndDelete(emailLabelRegEx);
    await typeAndCheckAndDelete(nameLabelRegEx);
    await typeAndCheckAndDelete(phoneLabelRegEx);
  });

  it("disables button when change is saved", async () => {
    const agent = userEvent.setup();
    const stringToType = "a"; // Valid final character of an email address.
    const user = mockUser();
    await renderUserSettingsGetUser();
    const submitButton = screen.getByText(UserSettingsTextId.ButtonSubmit);

    const typeAndCheckEnabled = async (label: Matcher): Promise<void> => {
      expect(submitButton).toBeDisabled();
      await agent.type(screen.getByLabelText(label), stringToType);
      expect(submitButton).toBeEnabled();
      await agent.click(submitButton);
      expect(submitButton).toBeDisabled();
    };

    user.email += stringToType;
    mockGetCurrentUser.mockReturnValueOnce({ ...user });
    await typeAndCheckEnabled(emailLabelRegEx);

    user.name += stringToType;
    mockGetCurrentUser.mockReturnValueOnce({ ...user });
    await typeAndCheckEnabled(nameLabelRegEx);

    user.phone += stringToType;
    mockGetCurrentUser.mockReturnValueOnce({ ...user });
    await typeAndCheckEnabled(phoneLabelRegEx);
  });

  it("updates user when something is changed and submitted", async () => {
    const agent = userEvent.setup();
    await renderUserSettings();

    await agent.type(screen.getByLabelText(nameLabelRegEx), "a");
    expect(mockUpdateUser).toHaveBeenCalledTimes(0);

    await agent.click(screen.getByText(UserSettingsTextId.ButtonSubmit));
    expect(mockUpdateUser).toHaveBeenCalledTimes(1);
  });

  it("doesn't update user when email is taken", async () => {
    const agent = userEvent.setup();
    await renderUserSettings(mockUser());

    await agent.type(screen.getByLabelText(emailLabelRegEx), "a");
    mockIsEmailOkay.mockResolvedValueOnce(false);

    await agent.click(screen.getByText(UserSettingsTextId.ButtonSubmit));
    expect(mockUpdateUser).toHaveBeenCalledTimes(0);
  });

  describe("email verification", () => {
    it("isn't available when email is disabled", async () => {
      mockEmailServiceEnabled.mockReturnValue(false);
      await renderUserSettings(mockUser());

      expect(
        screen.queryByLabelText(UserSettingsTextId.TooltipEmailUnverified)
      ).toBeNull();
      expect(
        screen.queryByLabelText(UserSettingsTextId.TooltipEmailVerified)
      ).toBeNull();
      expect(
        screen.queryByLabelText(UserSettingsTextId.TooltipEmailVerifying)
      ).toBeNull();
    });

    it("doesn't update user or request email verification when email is taken", async () => {
      const agent = userEvent.setup();
      mockEmailServiceEnabled.mockReturnValue(true);
      await renderUserSettings(mockUser());
      mockIsEmailOkay.mockResolvedValueOnce(false);

      await agent.click(
        screen.getByLabelText(UserSettingsTextId.TooltipEmailUnverified)
      );
      expect(mockRequestEmailVerify).not.toHaveBeenCalled();
      expect(mockUpdateUser).not.toHaveBeenCalled();

      expect(
        screen.queryByLabelText(UserSettingsTextId.TooltipEmailUnverified)
      ).toBeTruthy();
      expect(
        screen.queryByLabelText(UserSettingsTextId.TooltipEmailVerifying)
      ).toBeNull();
    });

    it("requests email verification but doesn't update user when email is unchanged", async () => {
      const agent = userEvent.setup();
      mockEmailServiceEnabled.mockReturnValue(true);
      await renderUserSettings(mockUser());
      mockIsEmailOkay.mockResolvedValueOnce(true);

      await agent.click(
        screen.getByLabelText(UserSettingsTextId.TooltipEmailUnverified)
      );
      expect(mockRequestEmailVerify).toHaveBeenCalledTimes(1);
      expect(mockUpdateUser).not.toHaveBeenCalled();

      expect(
        screen.queryByLabelText(UserSettingsTextId.TooltipEmailUnverified)
      ).toBeNull();
      expect(
        screen.queryByLabelText(UserSettingsTextId.TooltipEmailVerifying)
      ).toBeTruthy();
    });

    it("updates user and requests email verification when email is changed", async () => {
      const agent = userEvent.setup();
      mockEmailServiceEnabled.mockReturnValue(true);
      await renderUserSettings(mockUser());

      const emailField = screen.getByLabelText(emailLabelRegEx);
      await agent.clear(emailField);
      await agent.type(emailField, "valid@and.free");
      mockIsEmailOkay.mockResolvedValueOnce(true);

      await agent.click(
        screen.getByLabelText(UserSettingsTextId.TooltipEmailUnverified)
      );
      expect(mockRequestEmailVerify).toHaveBeenCalledTimes(1);
      expect(mockUpdateUser).toHaveBeenCalledTimes(1);

      expect(
        screen.queryByLabelText(UserSettingsTextId.TooltipEmailUnverified)
      ).toBeNull();
      expect(
        screen.queryByLabelText(UserSettingsTextId.TooltipEmailVerifying)
      ).toBeTruthy();
    });
  });
});
