//external modules
import * as React from "react";
import {
  Translate,
  LocalizeContextProps,
  withLocalize
} from "react-localize-redux";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import {
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Typography,
  Link
} from "@material-ui/core";
import history from "../../../history";

export interface LoginDispatchProps {
  login?: (user: string, password: string) => void;
  logout: () => void;
}

export interface LoginStateProps {
  loginAttempt: boolean | undefined;
  loginFailure: boolean | undefined;
}

export interface LoginState {
  user: string;
  password: string;
  error: { password: boolean; username: boolean };
}

export class Login extends React.Component<
  LoginDispatchProps & LoginStateProps & LocalizeContextProps,
  LoginState
> {
  constructor(
    props: LoginDispatchProps & LoginStateProps & LocalizeContextProps
  ) {
    super(props);
    this.props.logout(); //Hitting the login page will log a user out (doubles as a logout page, essentially)
    this.state = {
      user: "",
      password: "",
      error: { password: false, username: false }
    };
  }

  updateUser(
    e: React.ChangeEvent<
      HTMLTextAreaElement | HTMLInputElement | HTMLSelectElement
    >
  ) {
    const user = e.target.value;
    const password = this.state.password;
    let error = { ...this.state.error, username: false };
    this.setState({ user, password, error });
  }

  updatePassword(
    e: React.ChangeEvent<
      HTMLTextAreaElement | HTMLInputElement | HTMLSelectElement
    >
  ) {
    const password = e.target.value;
    const user = this.state.user;
    let error = { ...this.state.error, password: false };
    this.setState({ password, user, error });
  }

  login(e: React.FormEvent<EventTarget>) {
    e.preventDefault();

    let user = this.state.user.trim();
    let pass = this.state.password.trim();
    let error = { ...this.state.error };
    error.password = pass === "";
    error.username = user === "";
    if (error.password || error.username) {
      this.setState({ error });
    } else if (this.props.login) {
      this.props.login(user, pass);
    }
  }

  render() {
    return (
      <Grid container justify="center">
        <Card style={{ width: 450 }}>
          <form onSubmit={e => this.login(e)}>
            <CardContent>
              {/* Title */}
              <Typography variant="h5" align="center" gutterBottom>
                <Translate id="login.title" />
              </Typography>

              {/* Username field */}
              <TextField
                required
                autoComplete="username"
                label={<Translate id="login.username" />}
                value={this.state.user}
                onChange={e => this.updateUser(e)}
                error={this.state.error["username"]}
                helperText={
                  this.state.error["username"] ? (
                    <Translate id="login.required" />
                  ) : null
                }
                variant="outlined"
                style={{ width: "100%" }}
                margin="normal"
                autoFocus
              />

              {/* Password field */}
              <TextField
                required
                autoComplete="current-password"
                label={<Translate id="login.password" />}
                type="password"
                value={this.state.password}
                onChange={e => this.updatePassword(e)}
                error={this.state.error["password"]}
                helperText={
                  this.state.error["password"] ? (
                    <Translate id="login.required" />
                  ) : null
                }
                variant="outlined"
                style={{ width: "100%" }}
                margin="normal"
              />

              {/* "Forgot password?" link to reset password */}
              <Typography>
                <Link href={"#"} variant="subtitle2">
                  <Translate id="login.forgotPassword" />
                </Link>
              </Typography>

              {/* "Failed to log in" */}
              {this.props.loginFailure && (
                <Typography
                  variant="body2"
                  style={{ marginTop: 24, marginBottom: 24, color: "red" }}
                >
                  <Translate id="login.failed" />
                </Typography>
              )}

              {/* Register and Login buttons */}
              <Grid container justify="flex-end" spacing={2}>
                <Grid item>
                  <Button
                    onClick={() => {
                      history.push("/register");
                    }}
                  >
                    <Translate id="login.register" />
                  </Button>
                </Grid>
                <Grid item>
                  <Button type="submit" variant="contained" color="primary">
                    <Translate id="login.login" />
                  </Button>
                </Grid>
                <br />
                {this.props.loginAttempt && <CircularProgress size={30} />}
              </Grid>
            </CardContent>
          </form>
        </Card>
      </Grid>
    );
  }
}

export default withLocalize(Login);
