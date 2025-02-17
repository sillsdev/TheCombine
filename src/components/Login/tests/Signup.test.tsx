import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { act } from "react";
import { Provider } from "react-redux";
import configureMockStore from "redux-mock-store";

import MockBypassLoadableButton from "components/Buttons/LoadingDoneButton";
import { CaptchaProps } from "components/Login/Captcha";
import { defaultState as loginState } from "components/Login/Redux/LoginReduxTypes";
import Signup, {
  SignupField,
  SignupId,
  signupFieldId,
  signupFieldTextId,
} from "components/Login/Signup";
import MockCaptcha from "components/Login/tests/MockCaptcha";

jest.mock("backend", () => ({
  getBannerText: () => Promise.resolve(""),
}));
jest.mock("components/Buttons", () => ({
  ...jest.requireActual("components/Buttons"),
  LoadingDoneButton: MockBypassLoadableButton,
}));
jest.mock("components/Login/Captcha", () => ({
  __esModule: true,
  default: (props: CaptchaProps) => <MockCaptcha {...props} />,
}));
jest.mock("components/Login/Redux/LoginActions", () => ({
  asyncSignUp: (...args: any[]) => mockAsyncSignUp(...args),
}));
jest.mock("rootRedux/hooks", () => {
  return {
    ...jest.requireActual("rootRedux/hooks"),
    useAppDispatch: () => jest.fn(),
  };
});

const mockAsyncSignUp = jest.fn();
const mockStore = configureMockStore()({ loginState });

const emailValid = "non@empty.com";
const nameValid = "Mr. Nonempty";
const passInvalid = "$hort";
const passValid = "@-least+8_chars";
const userInvalid = "no";
const userValid = "3+ letters long";

const renderSignup = async (): Promise<void> => {
  await act(async () => {
    render(
      <Provider store={mockStore}>
        <Signup />
      </Provider>
    );
  });
};

const typeInFields = async (
  textRecord: Record<SignupField, string>
): Promise<void> => {
  const agent = userEvent.setup();
  for (const [field, text] of Object.entries(textRecord)) {
    if (!text) {
      return;
    }
    await act(async () => {
      const id = signupFieldId[field as SignupField];
      const input = within(screen.getByTestId(id)).getByRole("textbox");
      await agent.type(input, text);
    });
  }
};

const submitAndCheckError = async (id?: SignupField): Promise<void> => {
  const agent = userEvent.setup();

  // Submit the form.
  await act(async () => {
    await agent.click(screen.getByTestId(SignupId.ButtonSignUp));
  });

  // Only the specified field should error.
  Object.values(SignupField).forEach((val) => {
    const field = screen.getByTestId(signupFieldId[val as SignupField]);
    const label = within(field).getByText(
      signupFieldTextId[val as SignupField]
    );

    const classes = label.className.split(" ");
    if (val === id) {
      expect(classes).toContain("Mui-error");
    } else {
      expect(classes).not.toContain("Mui-error");
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
    // Don't test with empty name or invalid email, because those prevent submission.

    it("errors when password too short", async () => {
      await renderSignup();
      await typeInFields({
        [SignupField.Email]: emailValid,
        [SignupField.Name]: nameValid,
        [SignupField.Password1]: passInvalid,
        [SignupField.Password2]: passInvalid,
        [SignupField.Username]: userValid,
      });
      await submitAndCheckError(SignupField.Password1);
    });

    it("errors when password don't match", async () => {
      await renderSignup();
      await typeInFields({
        [SignupField.Email]: emailValid,
        [SignupField.Name]: nameValid,
        [SignupField.Password1]: passValid,
        [SignupField.Password2]: `${passValid}++`,
        [SignupField.Username]: userValid,
      });
      await submitAndCheckError(SignupField.Password2);
    });

    it("errors when username too short", async () => {
      await renderSignup();
      await typeInFields({
        [SignupField.Email]: emailValid,
        [SignupField.Name]: nameValid,
        [SignupField.Password1]: passValid,
        [SignupField.Password2]: passValid,
        [SignupField.Username]: userInvalid,
      });
      await submitAndCheckError(SignupField.Username);
    });

    it("submits when all fields valid", async () => {
      await renderSignup();
      await typeInFields({
        [SignupField.Email]: emailValid,
        [SignupField.Name]: nameValid,
        [SignupField.Password1]: passValid,
        [SignupField.Password2]: passValid,
        [SignupField.Username]: userValid,
      });
      await submitAndCheckError();
    });
  });
});
