import renderer from "react-test-renderer";

import "tests/mockReactI18next.ts";

import LoadingDoneButton from "components/Buttons/LoadingDoneButton";
import EmailInvite from "components/ProjectSettings/ProjectUsers/EmailInvite";

jest.mock("backend", () => ({
  emailInviteToProject: () => mockEmailInviteToProject(),
  getUserByEmail: jest.fn(),
  isEmailTaken: () => mockIsEmailTaken(),
}));
jest.mock("backend/localStorage", () => ({
  getProjectId: () => mockId,
}));

const mockId = "mockId";

const mockAddToProject = jest.fn();
const mockClose = jest.fn();
const mockEmailInviteToProject = jest.fn();
const mockIsEmailTaken = jest.fn();

let testRenderer: renderer.ReactTestRenderer;

describe("EmailInvite", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    renderer.act(() => {
      testRenderer = renderer.create(
        <EmailInvite addToProject={mockAddToProject} close={mockClose} />
      );
    });
  });

  it("closes after submit", async () => {
    await renderer.act(async () => {
      testRenderer.root
        .findByType(LoadingDoneButton)
        .props.buttonProps.onClick();
    });
    expect(mockClose).toBeCalledTimes(1);
  });

  it("adds user if already exists", async () => {
    mockIsEmailTaken.mockResolvedValueOnce(true);
    await renderer.act(async () => {
      testRenderer.root
        .findByType(LoadingDoneButton)
        .props.buttonProps.onClick();
    });
    expect(mockAddToProject).toBeCalledTimes(1);
    expect(mockEmailInviteToProject).not.toBeCalled();
  });

  it("invite user if doesn't exists", async () => {
    mockIsEmailTaken.mockResolvedValueOnce(false);
    await renderer.act(async () => {
      testRenderer.root
        .findByType(LoadingDoneButton)
        .props.buttonProps.onClick();
    });
    expect(mockAddToProject).not.toBeCalled();
    expect(mockEmailInviteToProject).toBeCalledTimes(1);
  });
});
