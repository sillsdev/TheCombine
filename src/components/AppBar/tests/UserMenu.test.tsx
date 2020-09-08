import { Menu, MenuItem, Button } from "@material-ui/core";
import { renderHook } from "@testing-library/react-hooks";
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
//let result: HookResult<JSX.Element>;
//let waitForNextUpdate = ()=>Promise<void>;

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
  const { result, waitForNextUpdate } = renderHook(UserMenu);
  /*renderer.act(() => {
    testRenderer = renderer.create(
      <Provider store={mockStore}>
        <React.Fragment>{UserMenu()}</React.Fragment>
      </Provider>
    );
  });*/
}

describe("Tests UserMenu", () => {
  it("should not show site settings to general users", async () => {
    mockUser.isAdmin = false;
    //renderUserMenu();
    const { result, waitForNextUpdate } = renderHook(UserMenu);
    await waitForNextUpdate();
    //testRenderer.root.findByType(Button).props.onClick();
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
