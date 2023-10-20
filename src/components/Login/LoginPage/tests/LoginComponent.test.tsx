import {
  ReactTestInstance,
  ReactTestRenderer,
  act,
  create,
} from "react-test-renderer";

import "tests/reactI18nextMock";

import Login from "components/Login/LoginPage/LoginComponent";

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
const LOGOUT = jest.fn();
let loginMaster: ReactTestRenderer;
let loginHandle: ReactTestInstance;

const DATA = "stuff";
const MOCK_EVENT = { preventDefault: jest.fn(), target: { value: DATA } };

describe("Testing login component", () => {
  beforeEach(async () => {
    await act(async () => {
      loginMaster = create(<Login logout={LOGOUT} reset={LOGOUT} />);
    });
    loginHandle = loginMaster.root.findByType(Login);
    LOGOUT.mockClear();
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
): void {
  loginHandle.instance.setState({ username, password });
  loginHandle.instance.login(MOCK_EVENT);
  expect(loginHandle.instance.state.error).toEqual({
    username: goodUsername,
    password: goodPassword,
  });
}
