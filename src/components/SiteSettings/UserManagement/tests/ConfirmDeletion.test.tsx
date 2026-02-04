import "@testing-library/jest-dom";
import { act, render, screen } from "@testing-library/react";

import { User, UserProjectInfo } from "api/models";
import ConfirmDeletion from "components/SiteSettings/UserManagement/ConfirmDeletion";
import { newUser } from "types/user";

jest.mock("backend", () => ({
  getUserProjects: (userId: string) => mockGetUserProjects(userId),
}));

const mockGetUserProjects = jest.fn();

const testUser: User = { ...newUser("Test User", "test-user"), id: "test-id" };

const renderConfirmDeletion = async (user?: User): Promise<void> => {
  await act(async () => {
    render(
      <ConfirmDeletion
        deleteUser={jest.fn()}
        handleCloseModal={jest.fn()}
        user={user}
      />
    );
  });
};

beforeEach(() => {
  jest.clearAllMocks();
  mockGetUserProjects.mockResolvedValue([]);
});

describe("ConfirmDeletion", () => {
  it("renders nothing when no user is provided", async () => {
    await renderConfirmDeletion();

    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("renders name and username when user is provided", async () => {
    await renderConfirmDeletion(testUser);

    expect(screen.getAllByRole("button").length).toBeGreaterThan(0);
    expect(screen.getByText(new RegExp(testUser.name))).toBeInTheDocument();
    expect(screen.getByText(new RegExp(testUser.username))).toBeInTheDocument();
  });

  it("has delete button disabled until projects load", async () => {
    let resHolder: (value: UserProjectInfo[]) => void;
    const promise = new Promise<UserProjectInfo[]>((res) => {
      resHolder = res;
    });
    mockGetUserProjects.mockReturnValue(promise);
    await renderConfirmDeletion(testUser);

    const deleteButton = screen.getByRole("button", { name: /delete/i });
    expect(deleteButton).toBeDisabled();

    await act(async () => resHolder([]));
    expect(deleteButton).not.toBeDisabled();
  });
});
