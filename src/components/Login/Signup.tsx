import {
  Button,
  Card,
  CardContent,
  Grid,
  TextField,
  Typography,
} from "@mui/material";
import { ChangeEvent, ReactElement, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import router from "browserRouter";
import { LoadingDoneButton } from "components/Buttons";
import Captcha from "components/Login/Captcha";
import { asyncSignUp } from "components/Login/Redux/LoginActions";
import { LoginStatus } from "components/Login/Redux/LoginReduxTypes";
import { reset } from "rootActions";
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

export enum SignupIds {
  ButtonLogIn = "signup-log-in-button",
  ButtonSignUp = "signup-sign-up-button",
  ButtonUserGuide = "signup-user-guide-button",
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

/** The signup page */
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
    setFieldText({ ...fieldText, [field]: true });
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
    const partialRecord = { [field]: e.target.value };
    setFieldText((prev) => ({ ...prev, ...partialRecord }));
  };

  const signUp = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    const name = fieldText[SignupField.Name].trim();
    const username = fieldText[SignupField.Username].trim();
    const email = punycode.toUnicode(fieldText[SignupField.Email].trim());
    const password1 = fieldText[SignupField.Password1].trim();
    const password2 = fieldText[SignupField.Password2].trim();

    // Error checking.
    const err: SignupError = {
      [SignupField.Name]: !name,
      [SignupField.Email]: !email,
      [SignupField.Password1]: !meetsPasswordRequirements(password1),
      [SignupField.Password2]: password1 !== password2!,
      [SignupField.Username]: !meetsUsernameRequirements(username),
    };
    if (Object.values(err).some((e) => e)) {
      setFieldError(err);
    } else {
      await dispatch(
        asyncSignUp(name, username, email, password1, props.returnToEmailInvite)
      );
    }
  };

  return (
    <Grid container justifyContent="center">
      <Card style={{ width: 450 }}>
        <form onSubmit={(e) => signUp(e)}>
          <CardContent>
            {/* Title */}
            <Typography variant="h5" align="center" gutterBottom>
              {t("signup.signUpNew")}
            </Typography>

            {/* Name field */}
            <TextField
              id={SignupIds.FieldName}
              required
              autoFocus
              autoComplete="name"
              label={t("signup.name")}
              value={fieldText[SignupField.Name]}
              onChange={(e) => updateField(e, SignupField.Name)}
              error={fieldError[SignupField.Name]}
              helperText={
                fieldError[SignupField.Name] ? t("signup.required") : undefined
              }
              variant="outlined"
              style={{ width: "100%" }}
              margin="normal"
              inputProps={{ maxLength: 100 }}
            />

            {/* Username field */}
            <TextField
              id={SignupIds.FieldUsername}
              required
              autoComplete="username"
              label={t("signup.username")}
              value={fieldText[SignupField.Username]}
              onChange={(e) => updateField(e, SignupField.Username)}
              onBlur={() => checkUsername()}
              error={fieldError[SignupField.Username]}
              helperText={t("signup.usernameRequirements")}
              variant="outlined"
              style={{ width: "100%" }}
              margin="normal"
              inputProps={{ maxLength: 100 }}
            />

            {/* email field */}
            <TextField
              id={SignupIds.FieldEmail}
              required
              type="email"
              autoComplete="email"
              label={t("signup.email")}
              value={fieldText[SignupField.Email]}
              onChange={(e) => updateField(e, SignupField.Email)}
              error={fieldError[SignupField.Email]}
              variant="outlined"
              style={{ width: "100%" }}
              margin="normal"
              inputProps={{ maxLength: 100 }}
            />

            {/* Password field */}
            <TextField
              id={SignupIds.FieldPassword1}
              required
              autoComplete="new-password"
              label={t("signup.password")}
              type="password"
              value={fieldText[SignupField.Password1]}
              onChange={(e) => updateField(e, SignupField.Password1)}
              error={fieldError[SignupField.Password1]}
              helperText={t("signup.passwordRequirements")}
              variant="outlined"
              style={{ width: "100%" }}
              margin="normal"
              inputProps={{ maxLength: 100 }}
            />

            {/* Confirm Password field */}
            <TextField
              id={SignupIds.FieldPassword2}
              autoComplete="new-password"
              label={t("signup.confirmPassword")}
              type="password"
              value={fieldText[SignupField.Password2]}
              onChange={(e) => updateField(e, SignupField.Password2)}
              error={fieldError[SignupField.Password2]}
              helperText={
                fieldError[SignupField.Password1]
                  ? t("signup.confirmPasswordError")
                  : undefined
              }
              variant="outlined"
              style={{ width: "100%" }}
              margin="normal"
              inputProps={{ maxLength: 100 }}
            />

            {/* "Failed to sign up" */}
            {!!error && (
              <Typography
                variant="body2"
                style={{ marginTop: 24, marginBottom: 24, color: "red" }}
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
                  id={SignupIds.ButtonLogIn}
                  type="button"
                  onClick={() => {
                    router.navigate(Path.Login);
                  }}
                  variant="outlined"
                >
                  {t("signup.backToLogin")}
                </Button>
              </Grid>
              <Grid item>
                <LoadingDoneButton
                  disabled={!isVerified}
                  loading={signupStatus === LoginStatus.InProgress}
                  done={signupStatus === LoginStatus.Success}
                  doneText={t("signup.signUpSuccess")}
                  buttonProps={{
                    id: SignupIds.ButtonSignUp,
                    color: "primary",
                  }}
                >
                  {t("signup.signUp")}
                </LoadingDoneButton>
              </Grid>
            </Grid>
          </CardContent>
        </form>
      </Card>
    </Grid>
  );
}
