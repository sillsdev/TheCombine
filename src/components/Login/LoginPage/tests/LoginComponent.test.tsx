import React from "react";
import LoginComponent, { Login, LoginState } from "../LoginComponent";
import ReactDOM from "react-dom";
import renderer, {
  ReactTestRenderer,
  ReactTestInstance,
} from "react-test-renderer";
jest.mock("@matt-block/react-recaptcha-v2", () => () => (
  <div id="mockRecaptcha">Recaptcha'ed</div>
));

const LOGOUT = jest.fn();
var loginMaster: ReactTestRenderer;
var loginHandle: ReactTestInstance;

const DATA = "stuff";
const MOCK_EVENT = {
  preventDefault: jest.fn(),
  target: {
    value: DATA,
  },
};
const ERROR_STATE: LoginState = {
  user: "",
  password: "",
  error: { password: true, username: true },
};

describe("Testing login component", () => {
  beforeEach(() => {
    renderer.act(() => {
      loginMaster = renderer.create(
        <LoginComponent
          logout={LOGOUT}
          loginAttempt={false}
          loginFailure={false}
          reset={LOGOUT}
        />
      );
    });
    loginHandle = loginMaster.root.findByType(Login);
    LOGOUT.mockClear();
  });

  it("Renders properly", () => {
    const div = document.createElement("div");
    ReactDOM.render(
      <LoginComponent
        logout={LOGOUT}
        loginAttempt={false}
        loginFailure={false}
        reset={LOGOUT}
      />,
      div
    );
    ReactDOM.unmountComponentAtNode(div);
  });

  // These test whether logging in with a username and password (the strings) should result in errors with the username or password (the booleans)
  test("Login: no data", () => {
    testLogin("", "", true, true);
  });

  test("Login: no password", () => {
    testLogin("User", "", false, true);
  });

  test("Login: no user", () => {
    testLogin("", "Password", true, false);
  });

  test("Login: all fields good", () => {
    testLogin("User", "Password", false, false);
  });
});

function testLogin(
  user: string,
  password: string,
  goodUser: boolean,
  goodPassword: boolean
) {
  loginHandle.instance.setState({ user: user, password: password });
  loginHandle.instance.login(MOCK_EVENT);
  expect(loginHandle.instance.state.error).toEqual({
    username: goodUser,
    password: goodPassword,
  });
}
