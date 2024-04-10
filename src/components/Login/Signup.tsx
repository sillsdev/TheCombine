import {
  Button,
  Card,
  CardContent,
  Grid,
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

import { LoadingDoneButton } from "components/Buttons";
import Captcha from "components/Login/Captcha";
import { asyncSignUp } from "components/Login/Redux/LoginActions";
import { LoginStatus } from "components/Login/Redux/LoginReduxTypes";
import { reset } from "rootActions";
import router from "router/browserRouter";
import { StoreState } from "types";
import { useAppDispatch, useAppSelector } from "types/hooks";
import { Path } from "types/path";
import { RuntimeConfig } from "types/runtimeConfig";
import {
  meetsPasswordRequirements,
  meetsUsernameRequirements,
} from "utilities/utilities";

enum SignupField {
  Email,
  Name,
  Password1,
  Password2,
  Username,
}

type SignupError = Record<SignupField, boolean>;
type SignupText = Record<SignupField, string>;

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

// Chrome silently converts non-ASCII characters in a Textfield of type="email".
// Use punycode.toUnicode() to convert them from punycode back to Unicode.
// eslint-disable-next-line @typescript-eslint/no-var-requires
const punycode = require("punycode/");

interface SignupProps {
  returnToEmailInvite?: () => void;
}

/** The Signup page (also used for ProjectInvite) */
export default function Signup(props: SignupProps): ReactElement {
  const dispatch = useAppDispatch();

  const { error, signupStatus } = useAppSelector(
    (state: StoreState) => state.loginState
  );

  const [fieldError, setFieldError] = useState<SignupError>(defaultSignupError);
  const [fieldText, setFieldText] = useState<SignupText>(defaultSignupText);
  const [isVerified, setIsVerified] = useState(
    !RuntimeConfig.getInstance().captchaRequired()
  );

  const { t } = useTranslation();

  useEffect(() => {
    const search = window.location.search;
    const email = new URLSearchParams(search).get("email");
    if (email) {
      setFieldText((prev) => ({ ...prev, [SignupField.Email]: email }));
    }
    dispatch(reset());
  }, [dispatch]);

  const errorField = (field: SignupField): void => {
    setFieldError((prev) => ({ ...prev, [field]: true }));
  };

  const checkUsername = (): void => {
    if (!meetsUsernameRequirements(fieldText[SignupField.Username])) {
      errorField(SignupField.Username);
    }
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
    const email = punycode.toUnicode(fieldText[SignupField.Email].trim());
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
      await dispatch(
        asyncSignUp(name, username, email, password1, props.returnToEmailInvite)
      );
    }
  };

  const defaultTextFieldProps: TextFieldProps = {
    inputProps: { maxLength: 100 },
    margin: "normal",
    required: true,
    style: { width: "100%" },
    variant: "outlined",
  };

  return (
    <Grid container justifyContent="center">
      <Card style={{ width: 450 }}>
        <form id={SignupId.Form} onSubmit={signUp}>
          <CardContent>
            {/* Title */}
            <Typography align="center" gutterBottom variant="h5">
              {t("login.signUpNew")}
            </Typography>

            {/* Name field */}
            <TextField
              {...defaultTextFieldProps}
              autoComplete="name"
              autoFocus
              error={fieldError[SignupField.Name]}
              helperText={
                fieldError[SignupField.Name] ? t("login.required") : undefined
              }
              id={SignupId.FieldName}
              label={t("login.name")}
              onChange={(e) => updateField(e, SignupField.Name)}
              value={fieldText[SignupField.Name]}
            />

            {/* Username field */}
            <TextField
              {...defaultTextFieldProps}
              autoComplete="username"
              error={fieldError[SignupField.Username]}
              helperText={t("login.usernameRequirements")}
              id={SignupId.FieldUsername}
              label={t("login.username")}
              onBlur={() => checkUsername()}
              onChange={(e) => updateField(e, SignupField.Username)}
              value={fieldText[SignupField.Username]}
            />

            {/* Email field */}
            <TextField
              {...defaultTextFieldProps}
              autoComplete="email"
              error={fieldError[SignupField.Email]}
              id={SignupId.FieldEmail}
              label={t("login.email")}
              onChange={(e) => updateField(e, SignupField.Email)}
              type="email"
              value={fieldText[SignupField.Email]}
            />

            {/* Password field */}
            <TextField
              {...defaultTextFieldProps}
              autoComplete="new-password"
              error={fieldError[SignupField.Password1]}
              helperText={t("login.passwordRequirements")}
              id={SignupId.FieldPassword1}
              label={t("login.password")}
              onChange={(e) => updateField(e, SignupField.Password1)}
              type="password"
              value={fieldText[SignupField.Password1]}
            />

            {/* Confirm Password field */}
            <TextField
              {...defaultTextFieldProps}
              autoComplete="new-password"
              error={fieldError[SignupField.Password2]}
              helperText={
                fieldError[SignupField.Password2]
                  ? t("login.confirmPasswordError")
                  : undefined
              }
              id={SignupId.FieldPassword2}
              label={t("login.confirmPassword")}
              onChange={(e) => updateField(e, SignupField.Password2)}
              type="password"
              value={fieldText[SignupField.Password2]}
            />

            {/* "Failed to sign up" */}
            {!!error && (
              <Typography
                style={{ color: "red", marginBottom: 24, marginTop: 24 }}
                variant="body2"
              >
                {t(error)}
              </Typography>
            )}

            <Captcha
              onExpire={() => setIsVerified(false)}
              onSuccess={() => setIsVerified(true)}
            />

            {/* Sign Up and Log In buttons */}
            <Grid container justifyContent="flex-end" spacing={2}>
              <Grid item>
                <Button
                  id={SignupId.ButtonLogIn}
                  onClick={() => router.navigate(Path.Login)}
                  type="button"
                  variant="outlined"
                >
                  {t("login.backToLogin")}
                </Button>
              </Grid>
              <Grid item>
                <LoadingDoneButton
                  buttonProps={{
                    color: "primary",
                    id: SignupId.ButtonSignUp,
                  }}
                  disabled={!isVerified}
                  done={signupStatus === LoginStatus.Success}
                  doneText={t("login.signUpSuccess")}
                  loading={signupStatus === LoginStatus.InProgress}
                >
                  {t("login.signUp")}
                </LoadingDoneButton>
              </Grid>
            </Grid>
          </CardContent>
        </form>
      </Card>
    </Grid>
  );
}
