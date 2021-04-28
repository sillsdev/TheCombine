import { Button, Card, Grid, TextField, Typography } from "@material-ui/core";
import ExitToAppIcon from "@material-ui/icons/ExitToApp";
import * as React from "react";
import { Translate } from "react-localize-redux";
import { RouteComponentProps } from "react-router";

import history, { Path } from "browserHistory";
import { RequestState } from "components/PasswordReset/Redux/ResetReduxTypes";
import { passwordRequirements } from "utilities";

interface MatchParams {
  token: string;
}

export interface ResetDispatchProps {
  passwordReset: (token: string, password: string) => void;
}

interface PasswordResetProps extends RouteComponentProps<MatchParams> {
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

export default class PasswordReset extends React.Component<
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
      passwordFitsRequirements: passwordRequirements(password),
      isPasswordConfirmed: password === confirmPassword,
      password: password,
      passwordConfirm: confirmPassword,
    });
  };

  render() {
    return (
      <div>
        <Grid container justify="center">
          <Card style={{ padding: 10, width: 450 }}>
            <form onSubmit={this.onSubmit}>
              <Typography variant="h5" align="center" gutterBottom>
                <Translate id="passwordReset.resetTitle" />
              </Typography>
              <Grid item>
                <TextField
                  variant="outlined"
                  label={<Translate id="login.password" />}
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
                    variant="body2"
                    style={{ display: "inline", margin: 24, color: "red" }}
                  >
                    <Translate id="login.passwordRequirements" />
                  </Typography>
                )}
              </Grid>
              <Grid item>
                <TextField
                  variant="outlined"
                  label={<Translate id="login.confirmPassword" />}
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
                      variant="body2"
                      style={{ display: "inline", margin: 24, color: "red" }}
                    >
                      <Translate id="login.confirmPasswordError" />
                    </Typography>
                  )}
              </Grid>

              <Grid container justify="flex-end" spacing={2}>
                <Grid item>
                  {this.props.resetState === RequestState.Fail &&
                  this.state.sentAttempt ? (
                    <React.Fragment>
                      <Typography
                        variant="body2"
                        style={{ display: "inline", margin: 24, color: "red" }}
                      >
                        <Translate id="passwordReset.resetFail" />
                      </Typography>
                      <Button
                        id="submit_button"
                        variant="contained"
                        color="primary"
                        onClick={this.backToLogin}
                      >
                        <Translate id="passwordReset.backToLogin" />
                        &nbsp;
                        <ExitToAppIcon />
                      </Button>
                    </React.Fragment>
                  ) : (
                    <Button
                      id="submit_button"
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
                      <Translate id="passwordReset.submit" />
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
