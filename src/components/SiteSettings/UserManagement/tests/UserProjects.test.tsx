import "@testing-library/jest-dom";
import { act, render, screen } from "@testing-library/react";

import { User } from "api/models";
import UserProjects from "components/SiteSettings/UserManagement/UserProjects";
import { newUser } from "types/user";

jest.mock("backend", () => ({
  getUserProjects: () => Promise.resolve([]),
}));

const testUser: User = { ...newUser("Test User", "test-user"), id: "test-id" };

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
    await renderUserProjects(testUser);
    expect(document.querySelector(typographySelector)).toBeInTheDocument();
    expect(screen.getByText(new RegExp(testUser.name))).toBeInTheDocument();
    expect(screen.getByText(new RegExp(testUser.username))).toBeInTheDocument();
  });
});
