import React from "react";
import ReactDOM from "react-dom";
import renderer, {
  ReactTestInstance,
  ReactTestRenderer,
} from "react-test-renderer";

import RegisterComponent, { Register } from "../RegisterComponent";

jest.mock("@matt-block/react-recaptcha-v2", () => () => (
  <div id="mockRecaptcha">Recaptcha'ed</div>
));

const REGISTER = jest.fn();
var registerMaster: ReactTestRenderer;
var registerHandle: ReactTestInstance;

const DATA = "stuff";
const MOCK_EVENT = {
  preventDefault: jest.fn(),
  target: {
    value: DATA,
  },
};

describe("Testing register component", () => {
  beforeEach(() => {
    renderer.act(() => {
      registerMaster = renderer.create(
        <RegisterComponent
          inProgress={false}
          success={false}
          failureMessage=""
          reset={REGISTER}
        />
      );
    });
    registerHandle = registerMaster.root.findByType(Register);
    REGISTER.mockClear();
  });

  it("Renders properly", () => {
    const div = document.createElement("div");
    ReactDOM.render(
      <RegisterComponent
        inProgress={false}
        success={false}
        failureMessage=""
        reset={REGISTER}
      />,
      div
    );
    ReactDOM.unmountComponentAtNode(div);
  });

  // These test whether various combinations of registration data should result in errors
  test("Register: no data", () => {
    testRegister("", "", "", "", "", true, true, true, false, true);
  });
});

function testRegister(
  name: string,
  user: string,
  password: string,
  confirmPassword: string,
  email: string,
  error_name: boolean,
  error_user: boolean,
  error_password: boolean,
  error_confirmPassword: boolean,
  error_email: boolean
) {
  registerHandle.instance.setState({
    name,
    user,
    password,
    confirmPassword,
    email,
  });
  registerHandle.instance.register(MOCK_EVENT);
  expect(registerHandle.instance.state.error).toEqual({
    name: error_name,
    user: error_user,
    password: error_password,
    confirmPassword: error_confirmPassword,
    email: error_email,
  });
}
