import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import { Button, Card, Grid, TextField, Typography } from "@mui/material";
import React from "react";
import { withTranslation, WithTranslation } from "react-i18next";
import { RouteComponentProps } from "react-router-dom";

import history, { Path } from "browserHistory";
import { RequestState } from "components/PasswordReset/Redux/ResetReduxTypes";
import { meetsPasswordRequirements } from "utilities";

export interface MatchParams {
  token: string;
}

export interface ResetDispatchProps {
  passwordReset: (token: string, password: string) => void;
}

interface PasswordResetProps
  extends RouteComponentProps<MatchParams>,
    WithTranslation {
  resetState: RequestState;
}

interface PasswordResetState {
  token: string;
  password: string;
  passwordConfirm: string;
  sentAttempt: boolean;
  passwordFitsRequirements: boolean;
  isPasswordConfirmed: boolean;
}

export class PasswordReset extends React.Component<
  PasswordResetProps & ResetDispatchProps,
  PasswordResetState
> {
  constructor(props: PasswordResetProps & ResetDispatchProps) {
    super(props);
    this.state = {
      token: props.match && props.match.params.token,
      password: "",
      passwordConfirm: "",
      sentAttempt: false,
      passwordFitsRequirements: false,
      isPasswordConfirmed: false,
    };
  }

  backToLogin = (event: React.FormEvent<HTMLElement>) => {
    event.preventDefault();
    history.push(Path.Login);
  };

  onSubmit = (event: React.FormEvent<HTMLElement>) => {
    this.setState({ sentAttempt: true });
    this.props.passwordReset(this.state.token, this.state.password);
    event.preventDefault();
  };

  onChangePassword = (password: string, confirmPassword: string) => {
    this.setState({
      passwordFitsRequirements: meetsPasswordRequirements(password),
      isPasswordConfirmed: password === confirmPassword,
      password: password,
      passwordConfirm: confirmPassword,
    });
  };

  render() {
    return (
      <div>
        <Grid container justifyContent="center">
          <Card style={{ padding: 10, width: 450 }}>
            <form onSubmit={this.onSubmit}>
              <Typography variant="h5" align="center" gutterBottom>
                {this.props.t("passwordReset.resetTitle")}
              </Typography>
              <Grid item>
                <TextField
                  id="password-reset-password1"
                  variant="outlined"
                  label={this.props.t("login.password")}
                  type="password"
                  value={this.state.password}
                  style={{ width: "100%" }}
                  margin="normal"
                  error={!this.state.passwordFitsRequirements}
                  onChange={(e) =>
                    this.onChangePassword(
                      e.target.value,
                      this.state.passwordConfirm
                    )
                  }
                />
                {!this.state.passwordFitsRequirements && (
                  <Typography
                    id="login.passwordRequirements"
                    variant="body2"
                    style={{ display: "inline", margin: 24, color: "red" }}
                  >
                    {this.props.t("login.passwordRequirements")}
                  </Typography>
                )}
              </Grid>
              <Grid item>
                <TextField
                  id="password-reset-password2"
                  variant="outlined"
                  label={this.props.t("login.confirmPassword")}
                  type="password"
                  value={this.state.passwordConfirm}
                  style={{ width: "100%" }}
                  margin="normal"
                  error={
                    !this.state.isPasswordConfirmed &&
                    this.state.passwordConfirm.length > 0
                  }
                  onChange={(e) =>
                    this.onChangePassword(this.state.password, e.target.value)
                  }
                />
                {!this.state.isPasswordConfirmed &&
                  this.state.passwordConfirm.length > 0 && (
                    <Typography
                      id="login.confirmPasswordError"
                      variant="body2"
                      style={{ display: "inline", margin: 24, color: "red" }}
                    >
                      {this.props.t("login.confirmPasswordError")}
                    </Typography>
                  )}
              </Grid>

              <Grid container justifyContent="flex-end" spacing={2}>
                <Grid item>
                  {this.props.resetState === RequestState.Fail &&
                  this.state.sentAttempt ? (
                    <React.Fragment>
                      <Typography
                        id="passwordReset.resetFail"
                        variant="body2"
                        style={{ display: "inline", margin: 24, color: "red" }}
                      >
                        {this.props.t("passwordReset.resetFail")}
                      </Typography>
                      <Button
                        id="password-reset-submit"
                        variant="contained"
                        color="primary"
                        onClick={this.backToLogin}
                      >
                        {this.props.t("passwordReset.backToLogin")}
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
                        !(
                          this.state.passwordFitsRequirements &&
                          this.state.isPasswordConfirmed
                        )
                      }
                      onClick={this.onSubmit}
                    >
                      {this.props.t("passwordReset.submit")}
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
}

export default withTranslation()(PasswordReset);
