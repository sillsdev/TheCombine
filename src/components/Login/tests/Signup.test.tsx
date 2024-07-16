import { ChangeEvent, FormEvent } from "react";
import { Provider } from "react-redux";
import {
  ReactTestInstance,
  ReactTestRenderer,
  act,
  create,
} from "react-test-renderer";
import configureMockStore from "redux-mock-store";

import { defaultState as loginState } from "components/Login/Redux/LoginReduxTypes";
import Signup, { SignupId } from "components/Login/Signup";

jest.mock("backend", () => ({
  getBannerText: () => Promise.resolve(""),
}));
jest.mock("components/Login/Redux/LoginActions", () => ({
  asyncSignUp: (...args: any[]) => mockAsyncSignUp(...args),
}));
jest.mock("components/Login/Turnstile", () => "div");
jest.mock("router/browserRouter");
jest.mock("rootRedux/hooks", () => {
  return {
    ...jest.requireActual("rootRedux/hooks"),
    useAppDispatch: () => jest.fn(),
  };
});

const mockAsyncSignUp = jest.fn();
const mockChangeEvent = (text: string): Partial<ChangeEvent> => ({
  target: { value: text } as HTMLTextAreaElement | HTMLInputElement,
});
const mockFormEvent: Partial<FormEvent> = { preventDefault: jest.fn() };
const mockStore = configureMockStore()({ loginState });

const emailValid = "non@empty.com";
const nameValid = "Mr. Nonempty";
const passInvalid = "$hort";
const passValid = "@-least+8_chars";
const userInvalid = "no";
const userValid = "3+ letters long";

let signupMaster: ReactTestRenderer;
let signupHandle: ReactTestInstance;

const renderSignup = async (): Promise<void> => {
  await act(async () => {
    signupMaster = create(
      <Provider store={mockStore}>
        <Signup />
      </Provider>
    );
  });
  signupHandle = signupMaster.root.findByType(Signup);
};

const typeInField = async (id: SignupId, text: string): Promise<void> => {
  const field = signupHandle.findByProps({ id });
  await act(async () => {
    await field.props.onChange(mockChangeEvent(text));
  });
};

const submitAndCheckError = async (id?: SignupId): Promise<void> => {
  // Submit the form.
  const form = signupHandle.findByProps({ id: SignupId.Form });
  await act(async () => {
    await form.props.onSubmit(mockFormEvent);
  });

  // Only the specified field should error.
  Object.values(SignupId).forEach((val) => {
    const field = signupHandle.findByProps({ id: val });
    if (val === id) {
      expect(field.props.error).toBeTruthy();
    } else {
      expect(field.props.error).toBeFalsy();
    }
  });

  // Expect signUp only when no field expected to error.
  if (id === undefined) {
    expect(mockAsyncSignUp).toHaveBeenCalled();
  } else {
    expect(mockAsyncSignUp).not.toHaveBeenCalled();
  }
};

beforeEach(async () => {
  jest.clearAllMocks();
});

describe("Signup", () => {
  describe("submit button", () => {
    it("errors when email blank", async () => {
      await renderSignup();
      await typeInField(SignupId.FieldEmail, "");
      await typeInField(SignupId.FieldName, nameValid);
      await typeInField(SignupId.FieldPassword1, passValid);
      await typeInField(SignupId.FieldPassword2, passValid);
      await typeInField(SignupId.FieldUsername, userValid);
      await submitAndCheckError(SignupId.FieldEmail);
    });

    it("errors when name blank", async () => {
      await renderSignup();
      await typeInField(SignupId.FieldEmail, emailValid);
      await typeInField(SignupId.FieldName, "");
      await typeInField(SignupId.FieldPassword1, passValid);
      await typeInField(SignupId.FieldPassword2, passValid);
      await typeInField(SignupId.FieldUsername, userValid);
      await submitAndCheckError(SignupId.FieldName);
    });

    it("errors when password too short", async () => {
      await renderSignup();
      await typeInField(SignupId.FieldEmail, emailValid);
      await typeInField(SignupId.FieldName, nameValid);
      await typeInField(SignupId.FieldPassword1, passInvalid);
      await typeInField(SignupId.FieldPassword2, passInvalid);
      await typeInField(SignupId.FieldUsername, userValid);
      await submitAndCheckError(SignupId.FieldPassword1);
    });

    it("errors when passwords don't match", async () => {
      await renderSignup();
      await typeInField(SignupId.FieldEmail, emailValid);
      await typeInField(SignupId.FieldName, nameValid);
      await typeInField(SignupId.FieldPassword1, passValid);
      await typeInField(SignupId.FieldPassword2, `${passValid}++`);
      await typeInField(SignupId.FieldUsername, userValid);
      await submitAndCheckError(SignupId.FieldPassword2);
    });

    it("errors when username too short", async () => {
      await renderSignup();
      await typeInField(SignupId.FieldEmail, emailValid);
      await typeInField(SignupId.FieldName, nameValid);
      await typeInField(SignupId.FieldPassword1, passValid);
      await typeInField(SignupId.FieldPassword2, passValid);
      await typeInField(SignupId.FieldUsername, userInvalid);
      await submitAndCheckError(SignupId.FieldUsername);
    });

    it("submits when all fields valid", async () => {
      await renderSignup();
      await typeInField(SignupId.FieldEmail, emailValid);
      await typeInField(SignupId.FieldName, nameValid);
      await typeInField(SignupId.FieldPassword1, passValid);
      await typeInField(SignupId.FieldPassword2, passValid);
      await typeInField(SignupId.FieldUsername, userValid);
      await submitAndCheckError();
    });
  });
});
