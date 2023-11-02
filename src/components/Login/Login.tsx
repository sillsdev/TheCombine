import ReCaptcha from "@matt-block/react-recaptcha-v2";
import { Help } from "@mui/icons-material";
import {
  Button,
  Card,
  CardContent,
  Grid,
  Link,
  TextField,
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
import router from "browserRouter";
import { LoadingButton } from "components/Buttons";
import { asyncLogIn } from "components/Login/Redux/LoginActions";
import { LoginStatus } from "components/Login/Redux/LoginReduxTypes";
import { reset } from "rootActions";
import { StoreState } from "types";
import { useAppDispatch, useAppSelector } from "types/hooks";
import { Path } from "types/path";
import { RuntimeConfig } from "types/runtimeConfig";
import theme from "types/theme";
import { openUserGuide } from "utilities/pathUtilities";

export enum LoginIds {
  ButtonLogIn = "login-log-in-button",
  ButtonSignUp = "login-sign-up-button",
  ButtonUserGuide = "login-user-guide-button",
  DivCaptcha = "login-captcha-div",
  FieldPassword = "login-password-field",
  FieldUsername = "login-username-field",
  Form = "login-form",
}

/** The login page (also doubles as a logout page) */
export default function Login(): ReactElement {
  const dispatch = useAppDispatch();

  const status = useAppSelector(
    (state: StoreState) => state.loginState.loginStatus
  );

  const [banner, setBanner] = useState("");
  const [isVerified, setIsVerified] = useState(
    !RuntimeConfig.getInstance().captchaRequired()
  );
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

  const login = (e: FormEvent): void => {
    e.preventDefault();
    const p = password.trim();
    const u = username.trim();
    setPasswordError(!p);
    setUsernameError(!u);
    if (p && u) {
      dispatch(asyncLogIn(u, p));
    }
  };

  return (
    <Grid container justifyContent="center">
      <Card style={{ width: 450 }}>
        <form data-testid={LoginIds.Form} id={LoginIds.Form} onSubmit={login}>
          <CardContent>
            {/* Title */}
            <Typography variant="h5" align="center" gutterBottom>
              {t("login.title")}
            </Typography>

            {/* Username field */}
            <TextField
              autoComplete="username"
              autoFocus
              data-testid={LoginIds.FieldUsername}
              error={usernameError}
              helperText={usernameError ? t("login.required") : undefined}
              id={LoginIds.FieldUsername}
              inputProps={{ maxLength: 100 }}
              label={t("login.username")}
              margin="normal"
              onChange={handleUpdateUsername}
              required
              style={{ width: "100%" }}
              value={username}
              variant="outlined"
            />

            {/* Password field */}
            <TextField
              autoComplete="current-password"
              data-testid={LoginIds.FieldPassword}
              error={passwordError}
              helperText={passwordError ? t("login.required") : undefined}
              id={LoginIds.FieldPassword}
              inputProps={{ maxLength: 100 }}
              label={t("login.password")}
              margin="normal"
              onChange={handleUpdatePassword}
              required
              style={{ width: "100%" }}
              type="password"
              value={password}
              variant="outlined"
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
                  {t("login.forgotPassword")}
                </Link>
              </Typography>
            )}

            {/* "Failed to log in" */}
            {status === LoginStatus.Failure && (
              <Typography
                style={{ color: "red", marginBottom: 24, marginTop: 24 }}
                variant="body2"
              >
                {t("login.failed")}
              </Typography>
            )}

            {RuntimeConfig.getInstance().captchaRequired() && (
              <div
                className="form-group"
                id={LoginIds.DivCaptcha}
                style={{ margin: "5px" }}
              >
                <ReCaptcha
                  onError={() =>
                    console.error(
                      "Something went wrong; check your connection."
                    )
                  }
                  onExpire={() => setIsVerified(false)}
                  onSuccess={() => setIsVerified(true)}
                  siteKey={RuntimeConfig.getInstance().captchaSiteKey()}
                  size="normal"
                  theme="light"
                />
              </div>
            )}

            {/* User Guide, Sign Up, and Log In buttons */}
            <Grid container justifyContent="flex-end" spacing={2}>
              <Grid item xs={4} sm={6}>
                <Button id={LoginIds.ButtonUserGuide} onClick={openUserGuide}>
                  <Help />
                </Button>
              </Grid>

              <Grid item xs={4} sm={3}>
                <Button
                  id={LoginIds.ButtonSignUp}
                  onClick={() => router.navigate(Path.SignUp)}
                  variant="outlined"
                >
                  {t("login.signUp")}
                </Button>
              </Grid>

              <Grid item xs={4} sm={3}>
                <LoadingButton
                  buttonProps={{
                    color: "primary",
                    "data-testid": LoginIds.ButtonLogIn,
                    id: LoginIds.ButtonLogIn,
                    type: "submit",
                  }}
                  disabled={!isVerified}
                  loading={status === LoginStatus.InProgress}
                >
                  {t("login.login")}
                </LoadingButton>
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
