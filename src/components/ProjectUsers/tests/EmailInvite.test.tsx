import renderer from "react-test-renderer";

import { LoadingDoneButton } from "components/Buttons";
import EmailInvite from "components/ProjectUsers/EmailInvite";

jest.mock("backend", () => ({
  emailInviteToProject: () => mockEmailInviteToProject(),
  getUserByEmail: jest.fn(),
  isEmailTaken: () => mockIsEmailTaken(),
}));
jest.mock("backend/localStorage", () => ({
  getProjectId: () => "mockId",
}));

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
    expect(mockClose).toHaveBeenCalledTimes(1);
  });

  it("adds user if already exists", async () => {
    mockIsEmailTaken.mockResolvedValueOnce(true);
    await renderer.act(async () => {
      testRenderer.root
        .findByType(LoadingDoneButton)
        .props.buttonProps.onClick();
    });
    expect(mockAddToProject).toHaveBeenCalledTimes(1);
    expect(mockEmailInviteToProject).not.toHaveBeenCalled();
  });

  it("invite user if doesn't exists", async () => {
    mockIsEmailTaken.mockResolvedValueOnce(false);
    await renderer.act(async () => {
      testRenderer.root
        .findByType(LoadingDoneButton)
        .props.buttonProps.onClick();
    });
    expect(mockAddToProject).not.toHaveBeenCalled();
    expect(mockEmailInviteToProject).toHaveBeenCalledTimes(1);
  });
});
