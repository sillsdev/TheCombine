import { ThemeProvider } from "@mui/material/styles";
import { act, cleanup, render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import configureMockStore from "redux-mock-store";

import UserMenu, { UserMenuList } from "components/AppBar/UserMenu";
import { Path } from "types/path";
import theme from "types/theme";

jest.mock("backend", () => ({
  isSiteAdmin: () => mockIsSiteAdmin(),
}));
jest.mock("backend/localStorage", () => ({
  getAvatar: jest.fn(),
  getCurrentUser: jest.fn(),
}));
jest.mock("components/Project/ProjectActions", () => ({}));
jest.mock("react-router-dom", () => ({
  useNavigate: jest.fn(),
}));

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
      render(
        <ThemeProvider theme={theme}>
          <Provider store={mockStore}>
            <UserMenu currentTab={Path.Root} />
          </Provider>
        </ThemeProvider>
      );
    });
    expect(screen.queryAllByRole("button")).toHaveLength(1);
  });
});

describe("UserMenuList", () => {
  it("has one more item for admins (Site Settings)", async () => {
    await renderMenuList();
    const normalMenuItems = screen.queryAllByRole("menuitem").length;
    cleanup();
    await renderMenuList(true);
    const adminMenuItems = screen.queryAllByRole("menuitem").length;
    expect(adminMenuItems).toBe(normalMenuItems + 1);
  });
});

async function renderMenuList(isAdmin = false): Promise<void> {
  await act(async () => {
    render(
      <Provider store={mockStore}>
        <UserMenuList isAdmin={isAdmin} onSelect={jest.fn()} />
      </Provider>
    );
  });
}
