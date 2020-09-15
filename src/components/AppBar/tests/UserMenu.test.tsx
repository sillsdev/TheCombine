import { MenuItem, Button } from "@material-ui/core";
import React from "react";
import configureMockStore from "redux-mock-store";
import renderer, { ReactTestRenderer } from "react-test-renderer";

import { User } from "../../../types/user";
import { defaultState } from "../../App/DefaultState";
import UserMenu, { getIsAdmin, UserMenuList } from "../UserMenu";

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

describe("Tests UserMenu", () => {
  it("renders without crashing", async () => {
    renderer.act(() => {
      testRenderer = renderer.create(<UserMenu />);
    });
    expect(testRenderer.root.findByType(Button)).toBeTruthy;
  });

  it("should return correct value for isAdmin", (done) => {
    mockUser.isAdmin = false;
    getIsAdmin().then((result) => {
      expect(result).toBeFalsy;
      mockUser.isAdmin = true;
      getIsAdmin().then((result) => {
        expect(result).toBeTruthy;
        done();
      });
    });
  });

  it("should only show site settings to general users", async () => {
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
