import {
  Button,
  Card,
  CardContent,
  CardHeader,
  Grid2,
  Stack,
  TextField,
  TextFieldProps,
  Typography,
} from "@mui/material";
import {
  ChangeEvent,
  FormEvent,
  ReactElement,
  useEffect,
  useState,
} from "react";
import { useTranslation } from "react-i18next";

import { requestEmailVerify } from "backend";
import { LoadingDoneButton } from "components/Buttons";
import Captcha from "components/Login/Captcha";
import { asyncSignUp } from "components/Login/Redux/LoginActions";
import { LoginStatus } from "components/Login/Redux/LoginReduxTypes";
import { reset } from "rootRedux/actions";
import { useAppDispatch, useAppSelector } from "rootRedux/hooks";
import { type StoreState } from "rootRedux/types";
import router from "router/browserRouter";
import { Path } from "types/path";
import { RuntimeConfig } from "types/runtimeConfig";
import { NormalizedTextField } from "utilities/fontComponents";
import {
  meetsPasswordRequirements,
  meetsUsernameRequirements,
} from "utilities/utilities";

export enum SignupField {
  Email = "email",
  Name = "name",
  Password1 = "password1",
  Password2 = "password2",
  Username = "username",
}

type SignupError = Record<SignupField, boolean>;
export type SignupText = Record<SignupField, string>;

const defaultSignupError: SignupError = {
  [SignupField.Email]: false,
  [SignupField.Name]: false,
  [SignupField.Password1]: false,
  [SignupField.Password2]: false,
  [SignupField.Username]: false,
};
const defaultSignupText: SignupText = {
  [SignupField.Email]: "",
  [SignupField.Name]: "",
  [SignupField.Password1]: "",
  [SignupField.Password2]: "",
  [SignupField.Username]: "",
};

export const signupFieldTextId: SignupText = {
  [SignupField.Email]: "login.email",
  [SignupField.Name]: "login.name",
  [SignupField.Password1]: "login.password",
  [SignupField.Password2]: "login.confirmPassword",
  [SignupField.Username]: "login.username",
};

export enum SignupId {
  ButtonLogIn = "signup-log-in-button",
  ButtonSignUp = "signup-sign-up-button",
  FieldEmail = "signup-email-field",
  FieldName = "signup-name-field",
  FieldPassword1 = "signup-password1-field",
  FieldPassword2 = "signup-password2-field",
  FieldUsername = "signup-username-field",
  Form = "signup-form",
}

export const signupFieldId: Record<SignupField, SignupId> = {
  [SignupField.Email]: SignupId.FieldEmail,
  [SignupField.Name]: SignupId.FieldName,
  [SignupField.Password1]: SignupId.FieldPassword1,
  [SignupField.Password2]: SignupId.FieldPassword2,
  [SignupField.Username]: SignupId.FieldUsername,
};

// Chrome silently converts non-ASCII characters in a Textfield of type="email".
// Use punycode.toUnicode() to convert them from punycode back to Unicode.
// eslint-disable-next-line @typescript-eslint/no-var-requires
const punycode = require("punycode/");

interface SignupProps {
  onSignup?: () => void;
}

/** The Signup page (also used for ProjectInvite) */
export default function Signup(props: SignupProps): ReactElement {
  const dispatch = useAppDispatch();

  const { error, signupStatus } = useAppSelector(
    (state: StoreState) => state.loginState
  );

  const [fieldError, setFieldError] = useState<SignupError>(defaultSignupError);
  const [fieldText, setFieldText] = useState<SignupText>(defaultSignupText);
  const [isVerified, setIsVerified] = useState(false);

  const { t } = useTranslation();

  useEffect(() => {
    const search = window.location.search;
    const email = new URLSearchParams(search).get("email");
    if (email) {
      setFieldText((prev) => ({ ...prev, [SignupField.Email]: email }));
    }
    dispatch(reset());
  }, [dispatch]);

  const errorField = (field: SignupField, error: boolean): void => {
    setFieldError((prev) => ({ ...prev, [field]: error }));
  };

  const checkUsername = (): void => {
    const username = fieldText[SignupField.Username].trim();
    errorField(SignupField.Username, !meetsUsernameRequirements(username));
  };

  const checkPassword1 = (): void => {
    const password1 = fieldText[SignupField.Password1].trim();
    errorField(SignupField.Password1, !meetsPasswordRequirements(password1));
  };

  const checkPassword2 = (): void => {
    const password1 = fieldText[SignupField.Password1].trim();
    const password2 = fieldText[SignupField.Password2].trim();
    errorField(SignupField.Password2, password1 !== password2);
  };

  const updateField = (
    e: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>,
    field: SignupField
  ): void => {
    setFieldText((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const signUp = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();

    // Trim whitespace off fields.
    const name = fieldText[SignupField.Name].trim();
    const username = fieldText[SignupField.Username].trim();
    const email = punycode
      .toUnicode(fieldText[SignupField.Email].trim())
      .normalize("NFC");
    const password1 = fieldText[SignupField.Password1].trim();
    const password2 = fieldText[SignupField.Password2].trim();

    // Check for bad field values.
    const err: SignupError = {
      [SignupField.Name]: !name,
      [SignupField.Username]: !meetsUsernameRequirements(username),
      [SignupField.Email]: !email,
      [SignupField.Password1]: !meetsPasswordRequirements(password1),
      [SignupField.Password2]: password1 !== password2,
    };

    if (Object.values(err).some((e) => e)) {
      setFieldError(err);
    } else {
      const onLogin = RuntimeConfig.getInstance().isOffline()
        ? undefined
        : async () => await requestEmailVerify(email);
      await dispatch(
        asyncSignUp(name, username, email, password1, props.onSignup, onLogin)
      );
    }
  };

  const defaultTextFieldProps = (field: SignupField): TextFieldProps => ({
    error: fieldError[field],
    id: signupFieldId[field],
    inputProps: { "data-testid": signupFieldId[field], maxLength: 100 },
    label: t(signupFieldTextId[field]),
    margin: "normal",
    onChange: (e) => updateField(e, field),
    required: true,
    style: { width: "100%" },
    value: fieldText[field],
    variant: "outlined",
  });

  return (
    <Grid2 container justifyContent="center">
      <Card sx={{ width: 450 }}>
        {/* Title */}
        <CardHeader
          title={
            <Typography align="center" variant="h5">
              {t("login.signUpNew")}
            </Typography>
          }
        />

        <CardContent>
          <form id={SignupId.Form} onSubmit={signUp}>
            <Stack spacing={2}>
              {/* Name field */}
              <NormalizedTextField
                {...defaultTextFieldProps(SignupField.Name)}
                autoComplete="name"
                autoFocus
                helperText={
                  fieldError[SignupField.Name] ? t("login.required") : undefined
                }
              />

              {/* Username field */}
              <NormalizedTextField
                {...defaultTextFieldProps(SignupField.Username)}
                autoComplete="username"
                helperText={t("login.usernameRequirements")}
                onBlur={() => checkUsername()}
              />

              {/* Email field */}
              {/* Don't use NormalizedTextField for type="email".
              At best, it doesn't normalize, because of the punycode. */}
              <TextField
                {...defaultTextFieldProps(SignupField.Email)}
                autoComplete="email"
                type="email"
              />

              {/* Password field */}
              <NormalizedTextField
                {...defaultTextFieldProps(SignupField.Password1)}
                autoComplete="new-password"
                helperText={t("login.passwordRequirements")}
                onBlur={() => checkPassword1()}
                type="password"
              />

              {/* Confirm Password field */}
              <NormalizedTextField
                {...defaultTextFieldProps(SignupField.Password2)}
                autoComplete="new-password"
                helperText={
                  fieldError[SignupField.Password2]
                    ? t("login.confirmPasswordError")
                    : undefined
                }
                onBlur={() => checkPassword2()}
                type="password"
              />

              {/* "Failed to sign up" */}
              {!!error && (
                <Typography sx={{ color: "error.main" }} variant="body2">
                  {t(error)}
                </Typography>
              )}

              <Captcha setSuccess={setIsVerified} />

              {/* Back-to-login and Sign-up buttons */}
              <Stack direction="row" justifyContent="flex-end" spacing={2}>
                <Button
                  data-testid={SignupId.ButtonLogIn}
                  id={SignupId.ButtonLogIn}
                  onClick={() => router.navigate(Path.Login)}
                  variant="outlined"
                >
                  {t("login.backToLogin")}
                </Button>

                <LoadingDoneButton
                  buttonProps={{
                    "data-testid": SignupId.ButtonSignUp,
                    id: SignupId.ButtonSignUp,
                    type: "submit",
                  }}
                  disabled={!isVerified}
                  done={signupStatus === LoginStatus.Success}
                  doneText={t("login.signUpSuccess")}
                  loading={signupStatus === LoginStatus.InProgress}
                >
                  {t("login.signUp")}
                </LoadingDoneButton>
              </Stack>
            </Stack>
          </form>
        </CardContent>
      </Card>
    </Grid2>
  );
}
