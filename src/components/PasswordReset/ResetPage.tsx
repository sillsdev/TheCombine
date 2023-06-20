import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import { Button, Card, Grid, TextField, Typography } from "@mui/material";
import React, { ReactElement, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";

import { resetPassword } from "backend";
import { Path } from "types/path";
import { meetsPasswordRequirements } from "utilities/utilities";

export enum PasswordResetTestIds {
  Password = "PasswordReset.password",
  PasswordReqError = "PasswordReset.requirements-error",
  ConfirmPassword = "PasswordReset.confirm-password",
  PasswordMatchError = "PasswordReset.match-error",
  PasswordResetFail = "PasswordReset.reset-fail",
  BackToLoginButton = "PasswordReset.button.back-to-login",
  SubmitButton = "PasswordReset.button.submit",
}

enum RequestState {
  None,
  Attempt,
  Fail,
  Success,
}

export default function PasswordReset(): ReactElement {
  const { token } = useParams();
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [passwordFitsRequirements, setPasswordFitsRequirements] =
    useState(false);
  const [isPasswordConfirmed, setIsPasswordConfirmed] = useState(false);
  const [requestState, setRequestState] = useState(RequestState.None);
  const { t } = useTranslation();
  const navigate = useNavigate();

  const backToLogin = (event: React.FormEvent<HTMLElement>): void => {
    event.preventDefault();
    navigate(Path.Login);
  };

  const onSubmit = async (
    event: React.FormEvent<HTMLElement>
  ): Promise<void> => {
    if (token) {
      setRequestState(RequestState.Attempt);
      await asyncReset(token, password);
      event.preventDefault();
    }
  };

  const onChangePassword = (
    newPassword: string,
    newConfirmPassword: string
  ): void => {
    setPasswordFitsRequirements(meetsPasswordRequirements(newPassword));
    setIsPasswordConfirmed(newPassword === newConfirmPassword);
    setPassword(newPassword);
    setPasswordConfirm(newConfirmPassword);
  };

  const asyncReset = async (token: string, password: string): Promise<void> => {
    if (await resetPassword(token, password)) {
      setRequestState(RequestState.Success);
      navigate(Path.Login);
    } else {
      setRequestState(RequestState.Fail);
    }
  };

  return (
    <Grid container justifyContent="center">
      <Card style={{ padding: 10, width: 450 }}>
        <form onSubmit={onSubmit}>
          <Typography variant="h5" align="center" gutterBottom>
            {t("passwordReset.resetTitle")}
          </Typography>
          <Grid item>
            <TextField
              id="password-reset-password1"
              variant="outlined"
              label={t("login.password")}
              type="password"
              value={password}
              style={{ width: "100%" }}
              margin="normal"
              error={!passwordFitsRequirements}
              inputProps={{ "data-testid": PasswordResetTestIds.Password }}
              onChange={(e) =>
                onChangePassword(e.target.value, passwordConfirm)
              }
            />
            {!passwordFitsRequirements && (
              <Typography
                id="login.passwordRequirements"
                data-testid={PasswordResetTestIds.PasswordReqError}
                variant="body2"
                style={{ display: "inline", margin: 24, color: "red" }}
              >
                {t("login.passwordRequirements")}
              </Typography>
            )}
          </Grid>
          <Grid item>
            <TextField
              id="password-reset-password2"
              inputProps={{
                "data-testid": PasswordResetTestIds.ConfirmPassword,
              }}
              variant="outlined"
              label={t("login.confirmPassword")}
              type="password"
              value={passwordConfirm}
              style={{ width: "100%" }}
              margin="normal"
              error={!isPasswordConfirmed && passwordConfirm.length > 0}
              onChange={(e) => onChangePassword(password, e.target.value)}
            />
            {!isPasswordConfirmed && passwordConfirm.length > 0 && (
              <Typography
                id="login.confirmPasswordError"
                data-testid={PasswordResetTestIds.PasswordMatchError}
                variant="body2"
                style={{ display: "inline", margin: 24, color: "red" }}
              >
                {t("login.confirmPasswordError")}
              </Typography>
            )}
          </Grid>

          <Grid container justifyContent="flex-end" spacing={2}>
            <Grid item>
              {requestState === RequestState.Fail ? (
                <React.Fragment>
                  <Typography
                    id="passwordReset.resetFail"
                    data-testid={PasswordResetTestIds.PasswordResetFail}
                    variant="body2"
                    style={{ display: "inline", margin: 24, color: "red" }}
                  >
                    {t("passwordReset.resetFail")}
                  </Typography>
                  <Button
                    id="password-reset-submit"
                    variant="contained"
                    color="primary"
                    data-testid={PasswordResetTestIds.BackToLoginButton}
                    onClick={backToLogin}
                  >
                    {t("passwordReset.backToLogin")}
                    &nbsp;
                    <ExitToAppIcon />
                  </Button>
                </React.Fragment>
              ) : (
                <Button
                  id="password-reset-submit"
                  data-testid={PasswordResetTestIds.SubmitButton}
                  variant="contained"
                  color="primary"
                  disabled={!(passwordFitsRequirements && isPasswordConfirmed)}
                  onClick={onSubmit}
                >
                  {t("passwordReset.submit")}
                </Button>
              )}
            </Grid>
          </Grid>
        </form>
      </Card>
    </Grid>
  );
}
