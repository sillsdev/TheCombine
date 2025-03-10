import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { act } from "react";
import { Provider } from "react-redux";
import configureMockStore from "redux-mock-store";

import MockBypassLoadableButton from "components/Buttons/LoadingDoneButton";
import { defaultState as loginState } from "components/Login/Redux/LoginReduxTypes";
import Signup, {
  SignupField,
  SignupId,
  SignupText,
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
  default: (props: any) => <MockCaptcha {...props} />,
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

const errorClass = "Mui-error";
const mockAsyncSignUp = jest.fn();
const mockStore = configureMockStore()({ loginState });

const passValid = "@-least+8_chars";
const validTexts: SignupText = {
  [SignupField.Email]: "non@empty.com",
  [SignupField.Name]: "Mr. Nonempty",
  [SignupField.Password1]: passValid,
  [SignupField.Password2]: passValid,
  [SignupField.Username]: "3+ letters long",
};

const renderSignup = async (): Promise<void> => {
  await act(async () => {
    render(
      <Provider store={mockStore}>
        <Signup />
      </Provider>
    );
  });
};

/** Types text into all fields, using text from the given `textRecord` when present,
 * and falling back to entries in `validTexts` for keys missing from `textRecord`. */
const typeInFields = async (textRecord: Partial<SignupText>): Promise<void> => {
  for (const field of Object.values(SignupField)) {
    const text = textRecord[field] ?? validTexts[field];
    if (!text) {
      continue;
    }
    const id = signupFieldId[field as SignupField];
    await userEvent.type(screen.getByTestId(id), text);
  }
};

/** Clicks the submit button and checks that only the specified field errors. */
const submitAndCheckError = async (id?: SignupField): Promise<void> => {
  // Submit the form.
  await act(async () => screen.getByTestId(SignupId.ButtonSignUp).click());

  // Only the specified field should error.
  Object.values(SignupField).forEach((val) => {
    const text = signupFieldTextId[val as SignupField];
    const classes = screen.getByText(text).className.split(" ");
    if (val === id) {
      expect(classes).toContain(errorClass);
    } else {
      expect(classes).not.toContain(errorClass);
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
  await renderSignup();
});

describe("Signup", () => {
  describe("submit button", () => {
    // Don't test with empty fields or invalid email, because those prevent submission.

    it("errors when name is whitespace", async () => {
      await typeInFields({ [SignupField.Name]: "  " });
      await submitAndCheckError(SignupField.Name);
    });

    it("errors when password is too short", async () => {
      const passInvalid = "$hort";
      await typeInFields({
        [SignupField.Password1]: passInvalid,
        [SignupField.Password2]: passInvalid,
      });
      await submitAndCheckError(SignupField.Password1);
    });

    it("errors when passwords don't match", async () => {
      await typeInFields({ [SignupField.Password2]: `${passValid}++` });
      await submitAndCheckError(SignupField.Password2);
    });

    it("errors when username is too short", async () => {
      await typeInFields({ [SignupField.Username]: "     no     " });
      await submitAndCheckError(SignupField.Username);
    });

    it("submits when all fields are valid", async () => {
      await typeInFields({});
      await submitAndCheckError();
    });
  });
});
