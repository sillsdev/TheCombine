import { Button, MenuItem } from "@mui/material";
import { Provider } from "react-redux";
import { act, create, ReactTestRenderer } from "react-test-renderer";
import configureMockStore from "redux-mock-store";

import "tests/reactI18nextMock";

import UserMenu, { getIsAdmin, UserMenuList } from "components/AppBar/UserMenu";
import { Path } from "types/path";
import { newUser } from "types/user";

jest.mock("backend", () => ({
  getUser: () => mockGetUser(),
}));
jest.mock("backend/localStorage", () => ({
  getAvatar: jest.fn(),
  getCurrentUser: jest.fn(),
  getUserId: () => mockGetUserId(),
}));
jest.mock("react-router-dom", () => ({
  useNavigate: jest.fn(),
}));

let testRenderer: ReactTestRenderer;

const mockStore = configureMockStore()();

const mockGetUser = jest.fn();
const mockGetUserId = jest.fn();
const mockUser = newUser();
const mockUserId = "mockUserId";

function setMockFunctions(): void {
  mockGetUser.mockResolvedValue(mockUser);
  mockGetUserId.mockReturnValue(mockUserId);
}

beforeEach(() => {
  jest.clearAllMocks();
  setMockFunctions();
});

describe("UserMenu", () => {
  it("renders without crashing", async () => {
    await act(async () => {
      testRenderer = create(
        <Provider store={mockStore}>
          <UserMenu currentTab={Path.Root} />
        </Provider>
      );
    });
    expect(testRenderer.root.findAllByType(Button).length).toEqual(1);
  });

  it("getIsAdmin returns correct value", async () => {
    mockUser.isAdmin = false;
    expect(await getIsAdmin()).toBeFalsy();
    mockUser.isAdmin = true;
    expect(await getIsAdmin()).toBeTruthy();
  });

  it("UserMenuList has one more item for admins (Site Settings)", async () => {
    await renderMenuList();
    const normalMenuItems = testRenderer.root.findAllByType(MenuItem).length;
    await renderMenuList(true);
    const adminMenuItems = testRenderer.root.findAllByType(MenuItem).length;
    expect(adminMenuItems).toBe(normalMenuItems + 1);
  });
});

async function renderMenuList(isAdmin = false): Promise<void> {
  await act(async () => {
    testRenderer = create(
      <Provider store={mockStore}>
        <UserMenuList isAdmin={isAdmin} onSelect={jest.fn()} />
      </Provider>
    );
  });
}
