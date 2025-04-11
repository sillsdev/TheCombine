import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { User } from "api/models";
import UserList from "components/ProjectUsers/UserList";
import { newUser } from "types/user";

jest.mock("backend", () => ({
  avatarSrc: () => jest.fn(),
  getAllUsers: () => mockGetAllUsers(),
}));

const mockGetAllUsers = jest.fn();

const userA: User = { ...newUser("NameA", "userA"), id: "A" };
const userB: User = { ...newUser("NameB", "userB"), id: "B" };
const mockUsers = [userA, userB];

const renderUserList = async (users: User[] = []): Promise<void> => {
  await act(async () => {
    render(
      <UserList
        addToProject={jest.fn()}
        minSearchLength={3}
        projectUsers={users}
      />
    );
  });
};

beforeEach(() => {
  jest.resetAllMocks();
});

describe("UserList", () => {
  it("shows no users by default", async () => {
    mockGetAllUsers.mockResolvedValue(mockUsers);
    await renderUserList(mockUsers);
    expect(screen.queryAllByRole("listitem")).toHaveLength(0);
  });

  it("shows user when filter has a match", async () => {
    mockGetAllUsers.mockResolvedValue(mockUsers);
    await renderUserList();
    await userEvent.type(screen.getByRole("textbox"), mockUsers[0].name);
    expect(screen.queryAllByRole("listitem")).toHaveLength(1);
  });
});
