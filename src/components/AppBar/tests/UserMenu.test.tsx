import { Button, MenuItem } from "@material-ui/core";
import React from "react";
import renderer, { ReactTestRenderer } from "react-test-renderer";

import UserMenu, { getIsAdmin, UserMenuList } from "components/AppBar/UserMenu";
import { User } from "types/user";

const mockOnSelect = jest.fn();
const mockUser = new User("", "", "");
const mockGetUser = jest.fn();
const mockUserId = "mockUserId";
let testRenderer: ReactTestRenderer;

jest.mock("backend", () => {
  return {
    getUser: () => mockGetUser(),
  };
});

jest.mock("backend/localStorage", () => {
  return {
    getUserId: jest.fn(() => mockUserId),
    getAvatar: jest.fn(),
  };
});

beforeEach(() => {
  jest.clearAllMocks();
  mockGetUser.mockImplementation(() => Promise.resolve(mockUser));
});

describe("UserMenu", () => {
  it("renders without crashing", () => {
    renderer.act(() => {
      testRenderer = renderer.create(<UserMenu />);
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
