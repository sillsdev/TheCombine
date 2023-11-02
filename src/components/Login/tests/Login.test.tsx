import "@testing-library/jest-dom";
import { act, cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import configureMockStore from "redux-mock-store";

import "tests/reactI18nextMock";

import Login, { LoginIds } from "components/Login/Login";
import { defaultState as loginState } from "components/Login/Redux/LoginReduxTypes";

jest.mock(
  "@matt-block/react-recaptcha-v2",
  () =>
    function MockRecaptcha() {
      return <div id="mockRecaptcha">Recaptcha</div>;
    }
);
jest.mock("backend", () => ({
  getBannerText: () => Promise.resolve(""),
}));
jest.mock("browserRouter");
jest.mock("components/Login/Redux/LoginActions", () => ({
  asyncLogIn: (...args: any[]) => mockAsyncLogIn(...args),
}));

const mockAsyncLogIn = jest.fn();
const mockStore = configureMockStore()({ loginState });

const renderLogin = async (): Promise<void> => {
  await act(async () => {
    render(
      <Provider store={mockStore}>
        <Login />
      </Provider>
    );
  });
};

beforeEach(async () => {
  jest.clearAllMocks();
});

afterEach(cleanup);

describe("Login", () => {
  describe("submit button", () => {
    it("errors when no username", async () => {
      const agent = userEvent.setup();
      await renderLogin();
      const field = screen.getByTestId(LoginIds.FieldPassword);
      await act(async () => {
        await agent.type(field, "?");
        await userEvent.click(screen.getByTestId(LoginIds.ButtonLogIn));
      });
      expect(mockAsyncLogIn).not.toBeCalled();
    });

    it("errors when no password", async () => {});

    it("submits when username and password", async () => {});
  });
});
