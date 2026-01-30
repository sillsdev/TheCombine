import "@testing-library/jest-dom";
import { act, render, screen } from "@testing-library/react";

import { User } from "api/models";
import UserProjects from "components/SiteSettings/UserManagement/UserProjects";
import { newUser } from "types/user";

jest.mock("components/SiteSettings/UserManagement/UserProjectsList", () => ({
  __esModule: true,
  default: () => <div />,
}));

const renderUserProjects = async (user?: User): Promise<void> => {
  await act(async () => {
    render(<UserProjects user={user} />);
  });
};

const typographySelector = '[class*="Typography"]';

describe("UserProjects", () => {
  it("renders nothing when no user is provided", async () => {
    await renderUserProjects();
    expect(document.querySelector(typographySelector)).not.toBeInTheDocument();
  });

  it("renders name and username when user is provided", async () => {
    const name = "Test User";
    const username = "test-user";
    const testUser: User = { ...newUser(name, username), id: "test-id" };
    await renderUserProjects(testUser);
    expect(document.querySelector(typographySelector)).toBeInTheDocument();
    expect(screen.getByText(new RegExp(name))).toBeInTheDocument();
    expect(screen.getByText(new RegExp(username))).toBeInTheDocument();
  });
});
