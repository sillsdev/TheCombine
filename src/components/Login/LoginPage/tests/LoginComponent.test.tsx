import renderer, {
  ReactTestInstance,
  ReactTestRenderer,
} from "react-test-renderer";

import Login from "components/Login/LoginPage/LoginComponent";

jest.mock("@matt-block/react-recaptcha-v2", () => () => (
  <div id="mockRecaptcha">Recaptcha'ed</div>
));
jest.mock("backend", () => ({
  getBannerText: () => Promise.resolve(""),
}));

const LOGOUT = jest.fn();
var loginMaster: ReactTestRenderer;
var loginHandle: ReactTestInstance;

const DATA = "stuff";
const MOCK_EVENT = {
  preventDefault: jest.fn(),
  target: { value: DATA },
};

describe("Testing login component", () => {
  beforeEach(() => {
    renderer.act(() => {
      loginMaster = renderer.create(
        <Login
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
    renderer.act(() => {
      renderer.create(
        <Login
          logout={LOGOUT}
          loginAttempt={false}
          loginFailure={false}
          reset={LOGOUT}
        />
      );
    });
  });

  // These test whether logging in with a username and password (the strings) should result in errors with the username or password (the booleans)
  test("Login: no data", () => {
    testLogin("", "", true, true);
  });

  test("Login: no password", () => {
    testLogin("Username", "", false, true);
  });

  test("Login: no username", () => {
    testLogin("", "Password", true, false);
  });

  test("Login: all fields good", () => {
    testLogin("Username", "Password", false, false);
  });
});

function testLogin(
  username: string,
  password: string,
  goodUsername: boolean,
  goodPassword: boolean
) {
  loginHandle.instance.setState({ username, password });
  loginHandle.instance.login(MOCK_EVENT);
  expect(loginHandle.instance.state.error).toEqual({
    username: goodUsername,
    password: goodPassword,
  });
}
