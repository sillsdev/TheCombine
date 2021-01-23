import { MenuItem, Button } from "@material-ui/core";
import React from "react";
import renderer, { ReactTestRenderer } from "react-test-renderer";

import { User } from "types/user";
import UserMenu, { getIsAdmin, UserMenuList } from "components/AppBar/UserMenu";

const mockUser = new User("", "", "");
let testRenderer: ReactTestRenderer;

jest.mock("backend", () => {
  return {
    getUser: jest.fn(() => {
      return Promise.resolve(mockUser);
    }),
  };
});

beforeEach(() => {
  jest.clearAllMocks();
});

describe("Tests UserMenu", () => {
  it("renders without crashing", () => {
    renderer.act(() => {
      testRenderer = renderer.create(<UserMenu />);
    });
    expect(testRenderer.root.findAllByType(Button).length).toEqual(1);
  });

  it("should have correct value for isAdmin", (done) => {
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
      testRenderer = renderer.create(<UserMenuList isAdmin={false} />);
    });
    const normalMenuItems = testRenderer.root.findAllByType(MenuItem).length;
    renderer.act(() => {
      testRenderer = renderer.create(<UserMenuList isAdmin={true} />);
    });
    const adminMenuItems = testRenderer.root.findAllByType(MenuItem).length;
    expect(adminMenuItems).toBe(normalMenuItems + 1);
  });
});
