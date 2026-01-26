import "@testing-library/jest-dom";
import { act, render, screen } from "@testing-library/react";

import { User } from "api/models";
import UserProjectsDialog from "components/SiteSettings/UserManagement/UserProjectsDialog";
import { newUser } from "types/user";

const mockGetUserProjects = jest.fn();

jest.mock("backend", () => ({
  getUserProjects: (...args: any[]) => mockGetUserProjects(...args),
}));

const testUser: User = { ...newUser(), id: "test-id", username: "testuser" };

const renderUserProjectsDialog = async (
  user?: User
): Promise<void> => {
  await act(async () => {
    render(<UserProjectsDialog user={user} />);
  });
};

beforeEach(() => {
  jest.clearAllMocks();
  mockGetUserProjects.mockResolvedValue([]);
});

describe("UserProjectsDialog", () => {
  it("renders nothing when no user is provided", async () => {
    await renderUserProjectsDialog();
    expect(screen.queryByText("testuser")).not.toBeInTheDocument();
  });
});
