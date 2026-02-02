import "@testing-library/jest-dom";
import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { User } from "api/models";
import UserActionsMenu, {
  UserActionsMenuProps,
} from "components/SiteSettings/UserManagement/UserActionsMenu";
import { newUser } from "types/user";

const mockOnDeleteClick = jest.fn();
const mockOnProjectsClick = jest.fn();

const testUser: User = { ...newUser(), id: "test-id", username: "testuser" };

const renderUserActionsMenu = async (
  props?: Partial<UserActionsMenuProps>
): Promise<void> => {
  await act(async () => {
    render(
      <UserActionsMenu
        user={props?.user ?? testUser}
        disableDelete={props?.disableDelete}
        onDeleteClick={mockOnDeleteClick}
        onProjectsClick={mockOnProjectsClick}
      />
    );
  });
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe("UserActionsMenu", () => {
  it("renders with menu button", async () => {
    await renderUserActionsMenu();
    const button = screen.getByRole("button");
    expect(button).toBeInTheDocument();
    expect(button).not.toBeDisabled();
  });

  it("opens menu when clicked and shows Projects and Delete options", async () => {
    await renderUserActionsMenu();

    await userEvent.click(screen.getByRole("button"));

    const menuItems = screen.getAllByRole("menuitem");
    expect(menuItems).toHaveLength(2);
    expect(menuItems[0]).toHaveTextContent(/project/i);
    expect(menuItems[1]).toHaveTextContent(/delete/i);
    expect(menuItems[0]).not.toHaveAttribute("aria-disabled", "true");
    expect(menuItems[1]).not.toHaveAttribute("aria-disabled", "true");
  });

  it("disables Delete menu item when disableDelete is true", async () => {
    await renderUserActionsMenu({ disableDelete: true });

    await userEvent.click(screen.getByRole("button"));

    const menuItems = screen.getAllByRole("menuitem");
    expect(menuItems).toHaveLength(2);
    expect(menuItems[0]).not.toHaveAttribute("aria-disabled", "true"); // Projects
    expect(menuItems[1]).toHaveAttribute("aria-disabled", "true"); // Delete
  });

  it("calls onProjectsClick when Projects menu item is clicked", async () => {
    await renderUserActionsMenu();

    await userEvent.click(screen.getByRole("button"));
    await userEvent.click(screen.getByText(/project/i));

    expect(mockOnDeleteClick).not.toHaveBeenCalled();
    expect(mockOnProjectsClick).toHaveBeenCalledTimes(1);
  });

  it("calls onDeleteClick when Delete menu item is clicked", async () => {
    await renderUserActionsMenu();

    await userEvent.click(screen.getByRole("button"));
    await userEvent.click(screen.getByText(/delete/i));

    expect(mockOnDeleteClick).toHaveBeenCalledTimes(1);
    expect(mockOnProjectsClick).not.toHaveBeenCalled();
  });
});
