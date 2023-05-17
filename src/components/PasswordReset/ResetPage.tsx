import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import { Button, Card, Grid, TextField, Typography } from "@mui/material";
import React, { ReactElement, useState } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { RouteComponentProps, useParams } from "react-router-dom";

import history, { Path } from "browserHistory";
import { asyncReset } from "components/PasswordReset/Redux/ResetActions";
import {
  PasswordResetState,
  RequestState,
} from "components/PasswordReset/Redux/ResetReduxTypes";
import { StoreStateDispatch } from "types/Redux/actions";
import { meetsPasswordRequirements } from "utilities";

export interface MatchParams {
  token: string;
}

export interface ResetDispatchProps {
  passwordReset: (token: string, password: string) => void;
}

interface PasswordResetProps extends RouteComponentProps<MatchParams> {
  resetState: RequestState;
}

export function PasswordReset(): ReactElement {
  const { token }: MatchParams = useParams();
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [sentAttempt, setSentAttempt] = useState(false);
  const [passwordFitsRequirements, setPasswordFitsRequirements] =
    useState(false);
  const [isPasswordConfirmed, setIsPasswordConfirmed] = useState(false);

  const { t } = useTranslation();

  const resetState = useSelector(
    (state: PasswordResetState) => state.resetState
  );

  const dispatch: StoreStateDispatch = useDispatch();

  const backToLogin = (event: React.FormEvent<HTMLElement>) => {
    event.preventDefault();
    history.push(Path.Login);
  };

  const onSubmit = (event: React.FormEvent<HTMLElement>) => {
    setSentAttempt(true);
    if (token) {
      dispatch(asyncReset(token, password));
      event.preventDefault();
    }
  };

  const onChangePassword = (password: string, confirmPassword: string) => {
    setPasswordFitsRequirements(meetsPasswordRequirements(password));
    setIsPasswordConfirmed(password === confirmPassword);
    setPassword(password);
    setPasswordConfirm(confirmPassword);
  };

  return (
    <div>
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
                onChange={(e) =>
                  onChangePassword(e.target.value, passwordConfirm)
                }
              />
              {!passwordFitsRequirements && (
                <Typography
                  id="login.passwordRequirements"
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
                  variant="body2"
                  style={{ display: "inline", margin: 24, color: "red" }}
                >
                  {t("login.confirmPasswordError")}
                </Typography>
              )}
            </Grid>

            <Grid container justifyContent="flex-end" spacing={2}>
              <Grid item>
                {resetState === RequestState.Fail && sentAttempt ? (
                  <React.Fragment>
                    <Typography
                      id="passwordReset.resetFail"
                      variant="body2"
                      style={{ display: "inline", margin: 24, color: "red" }}
                    >
                      {t("passwordReset.resetFail")}
                    </Typography>
                    <Button
                      id="password-reset-submit"
                      variant="contained"
                      color="primary"
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
                    variant="contained"
                    color="primary"
                    disabled={
                      !(passwordFitsRequirements && isPasswordConfirmed)
                    }
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
    </div>
  );
}

// function mapDispatchToProps(dispatch: StoreStateDispatch): ResetDispatchProps {
//   return {
//     passwordReset: (token: string, password: string) => {
//       dispatch(asyncReset(token, password));
//     },
//   };
// }

// export default connect(null, mapDispatchToProps)(PasswordResetComponent);
