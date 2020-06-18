import * as React from "react";
import {
  Translate,
  LocalizeContextProps,
  withLocalize,
} from "react-localize-redux";
import { RouteComponentProps } from "react-router";
import {
  CircularProgress,
  Typography,
  Card,
  Button,
  Grid,
  TextField,
} from "@material-ui/core";

export interface MatchParams {
  token: string;
}

export interface ResetDispatchProps {
  passwordReset: (email: string, token: string, password: string) => void;
}

export interface PasswordResetProps extends RouteComponentProps<MatchParams> {
  resetAttempt: boolean;
  resetFailure: boolean;
  resetSuccess: boolean;
}

export interface PasswordResetState {
  token: string;
  email: string;
  password: string;
  passwordConfirm: string;
  sentAttempt: boolean;
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
      token: this.props.match.params.token,
      email: "",
      password: "",
      passwordConfirm: "",
      sentAttempt: false,
    };
  }

  render() {
    return (
      <div>
        <Grid container justify="center">
          <Card style={{ padding: 10, width: 450 }}>
            <form
              onSubmit={() => {
                this.setState({
                  ...this.state,
                  sentAttempt: true,
                });
                this.props.passwordReset(
                  this.state.email,
                  this.state.token,
                  this.state.password
                );
              }}
            >
              <Typography variant="h5" align="center" gutterBottom>
                Reset Password
              </Typography>

              <Grid item>
                <TextField
                  variant="outlined"
                  label="Token"
                  value={this.state.token}
                  style={{ width: "100%" }}
                  margin="normal"
                  onChange={(e) =>
                    this.setState({ ...this.state, token: e.target.value })
                  }
                />
              </Grid>
              <Grid item>
                <TextField
                  variant="outlined"
                  label="Email"
                  value={this.state.email}
                  style={{ width: "100%" }}
                  margin="normal"
                  onChange={(e) =>
                    this.setState({ ...this.state, email: e.target.value })
                  }
                />
              </Grid>
              <Grid item>
                <TextField
                  variant="outlined"
                  label="Password"
                  type="password"
                  value={this.state.password}
                  style={{ width: "100%" }}
                  margin="normal"
                  onChange={(e) =>
                    this.setState({ ...this.state, password: e.target.value })
                  }
                />
              </Grid>
              <Grid item>
                <TextField
                  variant="outlined"
                  label="Confirm Password"
                  type="password"
                  value={this.state.passwordConfirm}
                  style={{ width: "100%" }}
                  margin="normal"
                  onChange={(e) =>
                    this.setState({
                      ...this.state,
                      passwordConfirm: e.target.value,
                    })
                  }
                />
              </Grid>

              <Grid container justify="flex-end" spacing={2}>
                <Grid item>
                  {this.props.resetFailure && this.state.sentAttempt && (
                    <Typography
                      variant="body2"
                      style={{ display: "inline", margin: 24, color: "red" }}
                    >
                      Failed to reset password
                    </Typography>
                  )}
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => {
                      this.setState({
                        ...this.state,
                        sentAttempt: true,
                      });
                      this.props.passwordReset(
                        this.state.email,
                        this.state.token,
                        this.state.password
                      );
                    }}
                  >
                    Submit
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
