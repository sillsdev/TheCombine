import { Button, MenuItem } from "@material-ui/core";
import { Provider } from "react-redux";
import renderer, { ReactTestRenderer } from "react-test-renderer";
import configureMockStore from "redux-mock-store";

import { Path } from "browserHistory";
import UserMenu, { getIsAdmin, UserMenuList } from "components/AppBar/UserMenu";
import { newUser } from "types/user";

jest.mock("backend", () => {
  return {
    getUser: () => mockGetUser(),
  };
});

jest.mock("backend/localStorage", () => {
  return {
    getAvatar: jest.fn(),
    getCurrentUser: jest.fn(),
    getUserId: () => mockGetUserId(),
  };
});

let testRenderer: ReactTestRenderer;

const mockStore = configureMockStore([])();

const mockGetUser = jest.fn();
const mockGetUserId = jest.fn();
const mockUser = newUser();
const mockUserId = "mockUserId";

function setMockFunctions() {
  mockGetUser.mockResolvedValue(mockUser);
  mockGetUserId.mockReturnValue(mockUserId);
}

beforeEach(() => {
  jest.clearAllMocks();
  setMockFunctions();
});

describe("UserMenu", () => {
  it("renders without crashing", () => {
    renderer.act(() => {
      testRenderer = renderer.create(
        <Provider store={mockStore}>
          <UserMenu currentTab={Path.Root} />
        </Provider>
      );
    });
    expect(testRenderer.root.findAllByType(Button).length).toEqual(1);
  });

  it("getIsAdmin returns correct value", (done) => {
    mockUser.isAdmin = false;
    getIsAdmin().then((result) => {
      expect(result).toEqual(false);
      mockUser.isAdmin = true;
      getIsAdmin().then((result) => {
        expect(result).toEqual(true);
        done();
      });
    });
  });

  it("admin users see one more item: Site Settings", async () => {
    renderMenuList();
    const normalMenuItems = testRenderer.root.findAllByType(MenuItem).length;
    renderMenuList(true);
    const adminMenuItems = testRenderer.root.findAllByType(MenuItem).length;
    expect(adminMenuItems).toBe(normalMenuItems + 1);
  });
});

function renderMenuList(isAdmin = false) {
  renderer.act(() => {
    testRenderer = renderer.create(
      <Provider store={mockStore}>
        <UserMenuList isAdmin={isAdmin} onSelect={jest.fn()} />
      </Provider>
    );
  });
}
