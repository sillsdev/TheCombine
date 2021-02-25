import { Button, MenuItem } from "@material-ui/core";
import React from "react";
import renderer, { ReactTestRenderer } from "react-test-renderer";

import { Path } from "browserHistory";
import UserMenu, { getIsAdmin, UserMenuList } from "components/AppBar/UserMenu";
import { User } from "types/user";

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

const mockGetUser = jest.fn();
const mockGetUserId = jest.fn();
const mockOnSelect = jest.fn();
const mockUser = new User("", "", "");
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
      testRenderer = renderer.create(<UserMenu currentTab={Path.Root} />);
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
    renderer.act(() => {
      testRenderer = renderer.create(
        <UserMenuList isAdmin={false} onSelect={mockOnSelect} />
      );
    });
    const normalMenuItems = testRenderer.root.findAllByType(MenuItem).length;
    renderer.act(() => {
      testRenderer = renderer.create(
        <UserMenuList isAdmin={true} onSelect={mockOnSelect} />
      );
    });
    const adminMenuItems = testRenderer.root.findAllByType(MenuItem).length;
    expect(adminMenuItems).toBe(normalMenuItems + 1);
  });
});
