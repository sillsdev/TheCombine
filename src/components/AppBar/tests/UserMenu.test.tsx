import { Button, MenuItem } from "@mui/material";
import { Provider } from "react-redux";
import { act, create, ReactTestRenderer } from "react-test-renderer";
import configureMockStore from "redux-mock-store";

import "localization/mocks/reactI18nextMock";

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

let testRenderer: ReactTestRenderer;

const mockStore = configureMockStore()();

const mockIsSiteAdmin = jest.fn();

function setMockFunctions(): void {
  mockIsSiteAdmin.mockResolvedValue(false);
}

beforeEach(() => {
  jest.clearAllMocks();
  setMockFunctions();
});

describe("UserMenu", () => {
  it("renders", async () => {
    await act(async () => {
      testRenderer = create(
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

async function renderMenuList(isAdmin = false): Promise<void> {
  await act(async () => {
    testRenderer = create(
      <Provider store={mockStore}>
        <UserMenuList isAdmin={isAdmin} onSelect={jest.fn()} />
      </Provider>
    );
  });
}
