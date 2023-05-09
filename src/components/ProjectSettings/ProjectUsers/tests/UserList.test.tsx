import renderer from "react-test-renderer";

import "tests/mockReactI18next.ts";

import UserList from "components/ProjectSettings/ProjectUsers/UserList";
import { User } from "api/models";
import { newUser } from "types/user";
import { Input, ListItem } from "@mui/material";

jest.mock("backend", () => ({
  avatarSrc: () => jest.fn(),
  getAllUsers: () => mockGetAllUsers(),
}));

const mockGetAllUsers = jest.fn();

const mockUsers = [newUser("NameA", "userA"), newUser("NameB", "userB")];

let testRenderer: renderer.ReactTestRenderer;

const renderUserList = async (users: User[] = []): Promise<void> => {
  await renderer.act(async () => {
    testRenderer = renderer.create(
      <UserList projectUsers={users} addToProject={jest.fn()} />
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
    expect(testRenderer.root.findAllByType(ListItem)).toHaveLength(0);
  });

  it("shows user when filter has a match", async () => {
    mockGetAllUsers.mockResolvedValue(mockUsers);
    await renderUserList();
    renderer.act(() => {
      testRenderer.root
        .findByType(Input)
        .props.onChange({ target: { value: mockUsers[0].name } });
    });
    expect(testRenderer.root.findAllByType(ListItem)).toHaveLength(1);
  });
});
