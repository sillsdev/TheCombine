import * as React from "react";
import { Translate, LocalizeContextProps } from "react-localize-redux";
import { RouteComponentProps } from "react-router";
import { Typography, Card, Button, Grid, TextField } from "@material-ui/core";

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

  onSubmit = (event: React.FormEvent<HTMLElement>) => {
    this.setState({
      ...this.state,
      sentAttempt: true,
    });
    this.props.passwordReset(
      this.state.email,
      this.state.token,
      this.state.password
    );
    event.preventDefault();
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
                    this.setState({ ...this.state, token: e.target.value })
                  }
                />
              </Grid>
              <Grid item>
                <TextField
                  variant="outlined"
                  label={<Translate id="passwordReset.emailLabel" />}
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
                  label={<Translate id="passwordReset.passwordLabel" />}
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
                  label={<Translate id="passwordReset.passwordConfLabel" />}
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
                      <Translate id="passwordReset.resetFail" />
                    </Typography>
                  )}
                  <Button
                    variant="contained"
                    color="primary"
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
