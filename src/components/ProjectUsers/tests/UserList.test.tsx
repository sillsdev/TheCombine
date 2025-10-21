import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { UserStub } from "api/models";
import UserList from "components/ProjectUsers/UserList";
import { newUserStub } from "types/user";

jest.mock("backend", () => ({
  avatarSrc: jest.fn(),
  getUsersByFilter: () => mockGetUsersByFilter(),
}));

const mockGetUsersByFilter = jest.fn();

const userA: UserStub = { ...newUserStub("NameA", "userA"), id: "A" };
const userB: UserStub = { ...newUserStub("NameB", "userB"), id: "B" };
const mockUsers = [userA, userB];

const renderUserList = async (users: UserStub[] = []): Promise<void> => {
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
    mockGetUsersByFilter.mockResolvedValue([]);
    await renderUserList(mockUsers);
    expect(screen.queryAllByRole("listitem")).toHaveLength(0);
  });

  it("shows user when filter has a match", async () => {
    mockGetUsersByFilter.mockResolvedValue([userA]);
    await renderUserList();
    await userEvent.type(screen.getByRole("textbox"), userA.name);
    expect(screen.queryAllByRole("listitem")).toHaveLength(1);
  });
});
