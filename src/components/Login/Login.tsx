import { Help } from "@mui/icons-material";
import {
  Button,
  Card,
  CardContent,
  Grid,
  Link,
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

import { BannerType } from "api/models";
import { getBannerText } from "backend";
import { LoadingButton } from "components/Buttons";
import Captcha from "components/Login/Captcha";
import { asyncLogIn } from "components/Login/Redux/LoginActions";
import { LoginStatus } from "components/Login/Redux/LoginReduxTypes";
import { reset } from "rootRedux/actions";
import { useAppDispatch, useAppSelector } from "rootRedux/hooks";
import { type StoreState } from "rootRedux/types";
import router from "router/browserRouter";
import { Path } from "types/path";
import { RuntimeConfig } from "types/runtimeConfig";
import theme from "types/theme";
import { openUserGuide } from "utilities/pathUtilities";

export enum LoginId {
  ButtonLogIn = "login-log-in-button",
  ButtonSignUp = "login-sign-up-button",
  ButtonUserGuide = "login-user-guide-button",
  FieldPassword = "login-password-field",
  FieldUsername = "login-username-field",
  Form = "login-form",
}

export enum LoginTextId {
  ButtonLogin = "login.login",
  ButtonSignUp = "login.signUp",
  Error401 = "login.failed",
  ErrorUnknown = "login.failedUnknownReason",
  FieldError = "login.required",
  LabelPassword = "login.password",
  LabelUsername = "login.username",
  LinkForgotPassword = "login.forgotPassword",
  Title = "login.title",
}

/** The Login page (also doubles as a Logout page) */
export default function Login(): ReactElement {
  const dispatch = useAppDispatch();

  const loginError = useAppSelector(
    (state: StoreState) => state.loginState.error
  );
  const status = useAppSelector(
    (state: StoreState) => state.loginState.loginStatus
  );

  const [banner, setBanner] = useState("");
  const [isVerified, setIsVerified] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState(false);
  const [username, setUsername] = useState("");
  const [usernameError, setUsernameError] = useState(false);

  const { t } = useTranslation();

  useEffect(() => {
    dispatch(reset());
    getBannerText(BannerType.Login).then(setBanner);
  }, [dispatch]);

  const handleUpdatePassword = (
    e: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
  ): void => setPassword(e.target.value);

  const handleUpdateUsername = (
    e: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
  ): void => setUsername(e.target.value);

  const logIn = (e: FormEvent): void => {
    e.preventDefault();
    const p = password.trim();
    const u = username.trim();
    setPasswordError(!p);
    setUsernameError(!u);
    if (p && u) {
      dispatch(asyncLogIn(u, p));
    }
  };

  const defaultTextFieldProps: TextFieldProps = {
    inputProps: {
      maxLength: 100,
      role: "textbox", // Since password fields don't have a role.
    },
    margin: "normal",
    required: true,
    style: { width: "100%" },
    variant: "outlined",
  };

  return (
    <Grid container justifyContent="center">
      <Card style={{ width: 450 }}>
        <form id={LoginId.Form} onSubmit={logIn}>
          <CardContent>
            {/* Title */}
            <Typography variant="h5" align="center" gutterBottom>
              {t(LoginTextId.Title)}
            </Typography>

            {/* Username field */}
            <TextField
              {...defaultTextFieldProps}
              autoComplete="username"
              autoFocus
              error={usernameError}
              helperText={usernameError ? t(LoginTextId.FieldError) : undefined}
              id={LoginId.FieldUsername}
              label={t(LoginTextId.LabelUsername)}
              onChange={handleUpdateUsername}
              value={username}
            />

            {/* Password field */}
            <TextField
              {...defaultTextFieldProps}
              autoComplete="current-password"
              error={passwordError}
              helperText={passwordError ? t(LoginTextId.FieldError) : undefined}
              id={LoginId.FieldPassword}
              label={t(LoginTextId.LabelPassword)}
              onChange={handleUpdatePassword}
              type="password"
              value={password}
            />

            {/* "Forgot password?" link to reset password */}
            {RuntimeConfig.getInstance().emailServicesEnabled() && (
              <Typography>
                <Link
                  href={"#"}
                  onClick={() => router.navigate(Path.PwRequest)}
                  underline="hover"
                  variant="subtitle2"
                >
                  {t(LoginTextId.LinkForgotPassword)}
                </Link>
              </Typography>
            )}

            {/* "Failed to log in" */}
            {status === LoginStatus.Failure && (
              <Typography
                style={{ color: "red", marginBottom: 24, marginTop: 24 }}
                variant="body2"
              >
                {t(
                  loginError.includes("401")
                    ? LoginTextId.Error401
                    : LoginTextId.ErrorUnknown
                )}
              </Typography>
            )}

            <Captcha setSuccess={setIsVerified} />

            {/* User Guide, Sign Up, and Log In buttons */}
            <Grid container justifyContent="space-between">
              <Grid item xs={1}>
                <Button
                  id={LoginId.ButtonUserGuide}
                  onClick={() => openUserGuide()}
                >
                  <Help />
                </Button>
              </Grid>

              <Grid
                container
                item
                justifyContent="flex-end"
                spacing={2}
                xs="auto"
              >
                <Grid item>
                  <Button
                    id={LoginId.ButtonSignUp}
                    onClick={() => router.navigate(Path.Signup)}
                    variant="outlined"
                  >
                    {t(LoginTextId.ButtonSignUp)}
                  </Button>
                </Grid>

                <Grid item>
                  <LoadingButton
                    buttonProps={{ id: LoginId.ButtonLogIn, type: "submit" }}
                    disabled={!isVerified}
                    loading={status === LoginStatus.InProgress}
                  >
                    {t(LoginTextId.ButtonLogin)}
                  </LoadingButton>
                </Grid>
              </Grid>
            </Grid>

            {/* Login announcement banner */}
            {!!banner && (
              <Typography
                style={{
                  marginTop: theme.spacing(2),
                  padding: theme.spacing(1),
                }}
              >
                {banner}
              </Typography>
            )}
          </CardContent>
        </form>
      </Card>
    </Grid>
  );
}
