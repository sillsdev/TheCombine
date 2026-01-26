import "@testing-library/jest-dom";
import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { User } from "api/models";
import UserActionsMenu from "components/SiteSettings/UserManagement/UserActionsMenu";
import { newUser } from "types/user";

const mockOnDeleteClick = jest.fn();
const mockOnProjectsClick = jest.fn();

const testUser: User = { ...newUser(), id: "test-id", username: "testuser" };

const renderUserActionsMenu = async (
  user: User = testUser,
  disableDelete = false
): Promise<void> => {
  await act(async () => {
    render(
      <UserActionsMenu
        user={user}
        disableDelete={disableDelete}
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
  it("renders with MoreVert icon", async () => {
    await renderUserActionsMenu();
    const button = screen.getByRole("button");
    expect(button).toBeInTheDocument();
    expect(button).not.toBeDisabled();
  });

  it("opens menu and shows Projects and Delete options when clicked", async () => {
    const agent = userEvent.setup();
    await renderUserActionsMenu();
    
    const button = screen.getByRole("button");
    await agent.click(button);

    // Check for menu items
    const menuItems = screen.getAllByRole("menuitem");
    expect(menuItems).toHaveLength(2);
    expect(menuItems[0]).toHaveTextContent("siteSettings.userActions.projects");
    expect(menuItems[1]).toHaveTextContent("buttons.delete");
  });

  it("disables Delete menu item when disableDelete is true", async () => {
    const agent = userEvent.setup();
    await renderUserActionsMenu(testUser, true);
    
    const button = screen.getByRole("button");
    await agent.click(button);

    const menuItems = screen.getAllByRole("menuitem");
    expect(menuItems[0]).not.toHaveAttribute("aria-disabled", "true"); // Projects
    expect(menuItems[1]).toHaveAttribute("aria-disabled", "true"); // Delete
  });

  it("calls onProjectsClick when Projects menu item is clicked", async () => {
    const agent = userEvent.setup();
    await renderUserActionsMenu();
    
    const button = screen.getByRole("button");
    await agent.click(button);
    
    const projectsItem = screen.getByText("siteSettings.userActions.projects");
    await agent.click(projectsItem);
    
    expect(mockOnProjectsClick).toHaveBeenCalledTimes(1);
  });

  it("calls onDeleteClick when Delete menu item is clicked", async () => {
    const agent = userEvent.setup();
    await renderUserActionsMenu();
    
    const button = screen.getByRole("button");
    await agent.click(button);
    
    const deleteItem = screen.getByText("buttons.delete");
    await agent.click(deleteItem);
    
    expect(mockOnDeleteClick).toHaveBeenCalledTimes(1);
  });
});

