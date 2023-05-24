import renderer from "react-test-renderer";

import "tests/reactI18nextMock";

import SignUp from "components/Login/SignUpPage/SignUpComponent";

jest.mock("@matt-block/react-recaptcha-v2", () => () => (
  <div id="mockRecaptcha">Recaptcha</div>
));
jest.mock("backend", () => ({
  isEmailUnavailable: () => false,
  isUsernameUnavailable: () => false,
}));

const mockReset = jest.fn();
let signUpMaster: renderer.ReactTestRenderer;
let signUpHandle: renderer.ReactTestInstance;

const DATA = "stuff";
const MOCK_EVENT = { preventDefault: jest.fn(), target: { value: DATA } };

describe("Testing sign up component", () => {
  beforeEach(() => {
    renderer.act(() => {
      signUpMaster = renderer.create(
        <SignUp failureMessage="" reset={mockReset} />
      );
    });
    signUpHandle = signUpMaster.root.findByType(SignUp);
    mockReset.mockClear();
  });

  describe("signUp", () => {
    // Test whether various combinations of sign up data should result in errors
    test("no data", () => {
      testSignUp("", "", "", "", "", true, true, true, false, true, false);
    });

    test("confirm password doesn't match password", () => {
      testSignUp(
        "Frodo Baggins",
        "underhill",
        "a@b.cd",
        "1234567890",
        "1234567899",
        false,
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
        "a@b.cd",
        "12345678",
        "12345678",
        false,
        true,
        false,
        false,
        false,
        false
      );
    });

    test("email invalid", () => {
      testSignUp(
        "Sméagol",
        "Gollum",
        "a@b@c",
        "myprecious",
        "myprecious",
        false,
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
        "a@b.cd",
        "sting",
        "sting",
        false,
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
  error_emailInvalid: boolean,
  error_emailTaken: boolean,
  error_password: boolean,
  error_confirmPassword: boolean
) {
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
    emailInvalid: error_emailInvalid,
    emailTaken: error_emailTaken,
    password: error_password,
    confirmPassword: error_confirmPassword,
  });
}
