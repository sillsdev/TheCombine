import "@testing-library/jest-dom";
import { act, render, screen } from "@testing-library/react";

import { User } from "api/models";
import ConfirmDeletion from "components/SiteSettings/UserManagement/ConfirmDeletion";
import { newUser } from "types/user";

jest.mock("components/SiteSettings/UserManagement/UserProjectsList", () => ({
  __esModule: true,
  default: () => <div />,
}));

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
});

describe("ConfirmDeletion", () => {
  it("renders nothing when no user is provided", async () => {
    await renderConfirmDeletion();

    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("renders name and username when user is provided", async () => {
    const testUser = newUser("Test User", "test-user");
    testUser.id = "test-id";
    await renderConfirmDeletion(testUser);

    expect(screen.getAllByRole("button").length).toBeGreaterThan(0);
    expect(screen.getByText(new RegExp(testUser.name))).toBeInTheDocument();
    expect(screen.getByText(new RegExp(testUser.username))).toBeInTheDocument();
    // Delete button disabled until projects load (mock doesn't call onLoaded)
    expect(screen.getByRole("button", { name: /delete/i })).toBeDisabled();
  });
});
