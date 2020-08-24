import { MenuItem } from "@material-ui/core";
import React from "react";
import configureMockStore from "redux-mock-store";
import { Provider } from "react-redux";
import renderer, { ReactTestRenderer } from "react-test-renderer";

import { User } from "../../../types/user";
import { defaultState } from "../../App/DefaultState";
import UserMenu from "../UserMenu";

const createMockStore = configureMockStore([]);
const mockStore = createMockStore(defaultState);
const mockUser = new User("", "", "");
let testRenderer: ReactTestRenderer;

jest.mock("../../../backend", () => {
  return {
    getUser: jest.fn(() => {
      return Promise.resolve(mockUser);
    }),
  };
});
jest.mock("../../../backend/localStorage");
jest.mock("../../../history");

beforeEach(() => {
  jest.clearAllMocks();
});

function renderUserMenu() {
  testRenderer = renderer.create(<UserMenu />);
}

describe("Tests UserMenu", () => {
  it("should not show site settings to general users", () => {
    renderUserMenu();
    const menuItems = testRenderer.root.findAllByType(MenuItem);
    expect(menuItems.length).toBe(2);
  });

  it("should show site settings to admin users", () => {
    mockUser.isAdmin = true;
    renderUserMenu();
    const menuItems = testRenderer.root.findAllByType(MenuItem);
    expect(menuItems.length).toBe(3);
  });
});
