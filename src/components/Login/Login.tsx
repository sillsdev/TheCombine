import { Help } from "@mui/icons-material";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  Grid2,
  Link,
  Stack,
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
import { NormalizedTextField } from "utilities/fontComponents";
import { openUserGuide } from "utilities/pathUtilities";
import { meetsPasswordRequirements } from "utilities/utilities";

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
  ErrorPassword = "login.passwordRequirements",
  ErrorUnknown = "login.failedUnknownReason",
  FieldError = "login.required",
  LabelPassword = "login.password",
  LabelUsername = "login.usernameOrEmail",
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
    const pOk = meetsPasswordRequirements(p);
    const u = username.trim();
    setPasswordError(!pOk);
    setUsernameError(!u);
    if (pOk && u) {
      dispatch(asyncLogIn(u, p));
    }
  };

  const defaultTextFieldProps = (id?: string): TextFieldProps => ({
    id,
    inputProps: { "data-testid": id, maxLength: 100 },
    margin: "normal",
    required: true,
    style: { width: "100%" },
    variant: "outlined",
  });

  return (
    <Grid2 container justifyContent="center">
      <Card sx={{ width: 450 }}>
        {/* Title */}
        <CardHeader
          title={
            <Typography align="center" variant="h5">
              {t(LoginTextId.Title)}
            </Typography>
          }
        />

        <CardContent>
          <form id={LoginId.Form} onSubmit={logIn}>
            <Stack spacing={2}>
              {/* Username field */}
              <NormalizedTextField
                {...defaultTextFieldProps(LoginId.FieldUsername)}
                autoComplete="username"
                autoFocus
                error={usernameError}
                helperText={
                  usernameError ? t(LoginTextId.FieldError) : undefined
                }
                label={t(LoginTextId.LabelUsername)}
                onChange={handleUpdateUsername}
                value={username}
              />

              {/* Password field */}
              <NormalizedTextField
                {...defaultTextFieldProps(LoginId.FieldPassword)}
                autoComplete="current-password"
                error={passwordError}
                helperText={
                  passwordError
                    ? password
                      ? t(LoginTextId.ErrorPassword)
                      : t(LoginTextId.FieldError)
                    : undefined
                }
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
                <Typography sx={{ color: "red" }} variant="body2">
                  {t(
                    loginError.includes("401")
                      ? LoginTextId.Error401
                      : LoginTextId.ErrorUnknown
                  )}
                </Typography>
              )}

              <Captcha setSuccess={setIsVerified} />

              {/* User Guide, Sign Up, and Log In buttons */}
              <Grid2 container spacing={2}>
                <Grid2 size="grow">
                  <Button
                    data-testid={LoginId.ButtonUserGuide}
                    id={LoginId.ButtonUserGuide}
                    onClick={() => openUserGuide()}
                  >
                    <Help />
                  </Button>
                </Grid2>

                <Button
                  data-testid={LoginId.ButtonSignUp}
                  id={LoginId.ButtonSignUp}
                  onClick={() => router.navigate(Path.Signup)}
                  variant="outlined"
                >
                  {t(LoginTextId.ButtonSignUp)}
                </Button>

                <LoadingButton
                  buttonProps={{
                    "data-testid": LoginId.ButtonLogIn,
                    id: LoginId.ButtonLogIn,
                    type: "submit",
                  }}
                  disabled={!isVerified}
                  loading={status === LoginStatus.InProgress}
                >
                  {t(LoginTextId.ButtonLogin)}
                </LoadingButton>
              </Grid2>

              {/* Login announcement banner */}
              {!!banner && <Typography>{banner}</Typography>}
            </Stack>
          </form>
        </CardContent>
      </Card>
    </Grid2>
  );
}
