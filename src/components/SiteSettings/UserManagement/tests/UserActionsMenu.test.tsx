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
  disabled = false
): Promise<void> => {
  await act(async () => {
    render(
      <UserActionsMenu
        user={user}
        disabled={disabled}
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
  it("renders with MoreVert icon when not disabled", async () => {
    await renderUserActionsMenu();
    const button = screen.getByRole("button");
    expect(button).toBeInTheDocument();
    expect(button).not.toBeDisabled();
  });

  it("is disabled when user is admin or current user", async () => {
    await renderUserActionsMenu(testUser, true);
    const button = screen.getByRole("button");
    expect(button).toBeDisabled();
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
