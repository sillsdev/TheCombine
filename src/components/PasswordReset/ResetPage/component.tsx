import * as React from "react";
import { Translate, LocalizeContextProps } from "react-localize-redux";
import { RouteComponentProps } from "react-router";
import { Typography, Card, Button, Grid, TextField } from "@material-ui/core";

export interface MatchParams {
  token: string;
}

export interface ResetDispatchProps {
  passwordReset: (token: string, password: string) => void;
}

export interface PasswordResetProps extends RouteComponentProps<MatchParams> {
  resetAttempt: boolean;
  resetFailure: boolean;
  resetSuccess: boolean;
}

export interface PasswordResetState {
  token: string;
  password: string;
  passwordConfirm: string;
  sentAttempt: boolean;
  passwordLength: boolean;
  passwordSame: boolean;
}

export default class PasswordReset extends React.Component<
  PasswordResetProps & LocalizeContextProps & ResetDispatchProps,
  PasswordResetState
> {
  constructor(
    props: PasswordResetProps & LocalizeContextProps & ResetDispatchProps
  ) {
    super(props);
    this.state = {
      token: this.props.match && this.props.match.params.token,
      password: "",
      passwordConfirm: "",
      sentAttempt: false,
      passwordLength: true,
      passwordSame: true,
    };
  }

  onSubmit = (event: React.FormEvent<HTMLElement>) => {
    this.setState((prevState) => ({
      ...this.state,
      sentAttempt: true,
    }));
    this.props.passwordReset(this.state.token, this.state.password);
    event.preventDefault();
  };

  onChangePassword = (password: string, confirmPassword: string) => {
    this.setState((prevState) => ({
      ...this.state,
      passwordLength: password.length < 8,
      passwordSame: password !== confirmPassword,
      password: password,
      passwordConfirm: confirmPassword,
    }));
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
                  label={<Translate id="passwordReset.tokenLabel" />}
                  value={this.state.token}
                  style={{ width: "100%" }}
                  margin="normal"
                  onChange={(e) =>
                    this.setState((prevState) => ({ ...this.state, token: e.target.value }))
                  }
                />
              </Grid>
              <Grid item>
                <TextField
                  variant="outlined"
                  label={<Translate id="login.password" />}
                  type="password"
                  value={this.state.password}
                  style={{ width: "100%" }}
                  margin="normal"
                  error={this.state.passwordLength}
                  onChange={(e) =>
                    this.onChangePassword(
                      e.target.value,
                      this.state.passwordConfirm
                    )
                  }
                />
                {this.state.passwordLength && (
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
                    this.state.passwordSame &&
                    this.state.passwordConfirm.length > 0
                  }
                  onChange={(e) =>
                    this.onChangePassword(this.state.password, e.target.value)
                  }
                />
                {this.state.passwordSame &&
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
                  {this.props.resetFailure && this.state.sentAttempt && (
                    <Typography
                      variant="body2"
                      style={{ display: "inline", margin: 24, color: "red" }}
                    >
                      <Translate id="passwordReset.resetFail" />
                    </Typography>
                  )}
                  <Button
                    id="submit_button"
                    variant="contained"
                    color="primary"
                    disabled={
                      this.state.passwordLength || this.state.passwordSame
                    }
                    onClick={this.onSubmit}
                  >
                    <Translate id="passwordReset.submit" />
                  </Button>
                </Grid>
              </Grid>
            </form>
          </Card>
        </Grid>
      </div>
    );
  }
}
