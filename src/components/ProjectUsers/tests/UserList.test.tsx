import { Input, ListItem } from "@mui/material";
import renderer from "react-test-renderer";

import "localization/mocks/reactI18nextMock";

import { User } from "api/models";
import UserList from "components/ProjectUsers/UserList";
import { newUser } from "types/user";

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
