import { Button, MenuItem } from "@mui/material";
import { Provider } from "react-redux";
import renderer from "react-test-renderer";
import configureMockStore from "redux-mock-store";

import "tests/reactI18nextMock";

import UserMenu, { UserMenuList } from "components/AppBar/UserMenu";
import { Path } from "types/path";

jest.mock("backend", () => ({
  isSiteAdmin: () => mockIsSiteAdmin(),
}));
jest.mock("backend/localStorage", () => ({
  getAvatar: jest.fn(),
  getCurrentUser: jest.fn(),
}));
jest.mock("react-router-dom", () => ({
  useNavigate: jest.fn(),
}));

let testRenderer: renderer.ReactTestRenderer;

const mockStore = configureMockStore()();

const mockIsSiteAdmin = jest.fn();

function setMockFunctions() {
  mockIsSiteAdmin.mockResolvedValue(false);
}

beforeEach(() => {
  jest.clearAllMocks();
  setMockFunctions();
});

describe("UserMenu", () => {
  it("renders", async () => {
    await renderer.act(async () => {
      testRenderer = renderer.create(
        <Provider store={mockStore}>
          <UserMenu currentTab={Path.Root} />
        </Provider>
      );
    });
    expect(testRenderer.root.findAllByType(Button).length).toEqual(1);
  });
});

describe("UserMenuList", () => {
  it("has one more item for admins (Site Settings)", async () => {
    await renderMenuList();
    const normalMenuItems = testRenderer.root.findAllByType(MenuItem).length;
    await renderMenuList(true);
    const adminMenuItems = testRenderer.root.findAllByType(MenuItem).length;
    expect(adminMenuItems).toBe(normalMenuItems + 1);
  });
});

async function renderMenuList(isAdmin = false) {
  await renderer.act(async () => {
    testRenderer = renderer.create(
      <Provider store={mockStore}>
        <UserMenuList isAdmin={isAdmin} onSelect={jest.fn()} />
      </Provider>
    );
  });
}
