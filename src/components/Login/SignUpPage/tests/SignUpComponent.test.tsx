import ReactDOM from "react-dom";
import renderer, {
  ReactTestInstance,
  ReactTestRenderer,
} from "react-test-renderer";

import SignUp from "components/Login/SignUpPage/SignUpComponent";

jest.mock("@matt-block/react-recaptcha-v2", () => () => (
  <div id="mockRecaptcha">Recaptcha</div>
));

jest.mock("backend", () => ({
  isEmailTaken: () => false,
  isUsernameTaken: () => false,
}));

const mockReset = jest.fn();
var signUpMaster: ReactTestRenderer;
var signUpHandle: ReactTestInstance;

const DATA = "stuff";
const MOCK_EVENT = {
  preventDefault: jest.fn(),
  target: {
    value: DATA,
  },
};

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

  it("Renders properly", () => {
    const div = document.createElement("div");
    ReactDOM.render(<SignUp failureMessage="" reset={mockReset} />, div);
    ReactDOM.unmountComponentAtNode(div);
  });

  // These test whether various combinations of sign up data should result in
  // errors
  test("Sign Up: no data", () => {
    testSignUp("", "", "", "", "", true, true, true, true, false);
  });
  test("Sign Up: confirm password doesn't match password", () => {
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
  test("Sign Up: username too short", () => {
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
  test("Sign Up: password too short", () => {
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
    email: error_email,
    password: error_password,
    confirmPassword: error_confirmPassword,
  });
}
