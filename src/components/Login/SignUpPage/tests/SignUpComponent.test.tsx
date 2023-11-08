import {
  ReactTestInstance,
  ReactTestRenderer,
  act,
  create,
} from "react-test-renderer";

import "tests/reactI18nextMock";

import { LoginStatus } from "components/Login/Redux/LoginReduxTypes";
import SignUp from "components/Login/SignUpPage/SignUpComponent";

jest.mock(
  "@matt-block/react-recaptcha-v2",
  () =>
    function MockRecaptcha() {
      return <div id="mockRecaptcha">Recaptcha</div>;
    }
);
jest.mock("browserRouter");

const mockReset = jest.fn();
let signUpMaster: ReactTestRenderer;
let signUpHandle: ReactTestInstance;

const DATA = "stuff";
const MOCK_EVENT = { preventDefault: jest.fn(), target: { value: DATA } };

describe("Testing sign up component", () => {
  beforeEach(async () => {
    await act(async () => {
      signUpMaster = create(
        <SignUp
          failureMessage=""
          reset={mockReset}
          status={LoginStatus.Default}
        />
      );
    });
    signUpHandle = signUpMaster.root.findByType(SignUp);
    mockReset.mockClear();
  });

  describe("signUp", () => {
    // Test whether various combinations of sign up data should result in errors
    test("no data", () => {
      testSignUp("", "", "", "", "", true, true, true, true, false);
    });

    test("confirm password doesn't match password", () => {
      testSignUp(
        "Frodo Baggins",
        "underhill",
        "a@b.c",
        "1234567890",
        "1234567899",
        false,
        false,
        false,
        false,
        true
      );
    });

    test("username too short", () => {
      testSignUp(
        "Samwise Gamgee",
        "sg",
        "a@b.c",
        "12345678",
        "12345678",
        false,
        true,
        false,
        false,
        false
      );
    });

    test("password too short", () => {
      testSignUp(
        "Bilbo Baggins",
        "bbb",
        "a@b.c",
        "sting",
        "sting",
        false,
        false,
        false,
        true,
        false
      );
    });
  });
});

async function testSignUp(
  name: string,
  username: string,
  email: string,
  password: string,
  confirmPassword: string,
  error_name: boolean,
  error_username: boolean,
  error_email: boolean,
  error_password: boolean,
  error_confirmPassword: boolean
): Promise<void> {
  signUpHandle.instance.setState({
    name,
    username,
    email,
    password,
    confirmPassword,
  });
  await signUpHandle.instance.signUp(MOCK_EVENT);
  expect(signUpHandle.instance.state.error).toEqual({
    name: error_name,
    username: error_username,
    email: error_email,
    password: error_password,
    confirmPassword: error_confirmPassword,
  });
}
