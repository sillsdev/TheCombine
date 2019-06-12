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
  CardActions,
  CardContent,
  CircularProgress,
  LinearProgress
} from "@material-ui/core";

export interface LoginDispatchProps {
  login?: (user: string, password: string) => void;
  logout: () => void;
  register?: (user: string, password: string) => void;
}

export interface LoginStateProps {
  loginAttempt: boolean | undefined;
  loginFailure: boolean | undefined;
}

interface LoginState {
  user: string;
  password: string;
  error: { password: boolean; username: boolean };
}

class Login extends React.Component<
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
    evt: React.ChangeEvent<
      HTMLTextAreaElement | HTMLInputElement | HTMLSelectElement
    >
  ) {
    const user = evt.target.value;
    const password = this.state.password;
    this.setState({ user, password });
  }

  updatePassword(
    evt: React.ChangeEvent<
      HTMLTextAreaElement | HTMLInputElement | HTMLSelectElement
    >
  ) {
    const password = evt.target.value;
    const user = this.state.user;
    let error = { ...this.state.error };
    error.password = false;
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

  register() {
    let user = this.state.user.trim();
    let pass = this.state.password.trim();
    let error = { ...this.state.error };
    error.password = pass === "";
    error.username = user === "";
    if (error.password || error.username) {
      this.setState({ error });
    } else if (this.props.register) {
      this.props.register(user, pass);
    }
  }

  render() {
    return (
      <Grid container justify="center">
        <Card>
          <form onSubmit={evt => this.login(evt)}>
            <CardContent>
              <TextField
                label={<Translate id="login.username" />}
                value={this.state.user}
                onChange={evt => this.updateUser(evt)}
                error={this.state.error["username"]}
                helperText={
                  this.state.error["username"] ? (
                    <Translate id="login.required" />
                  ) : null
                }
                margin="normal"
              />
              <br />
              <TextField
                label={<Translate id="login.password" />}
                type="password"
                value={this.state.password}
                onChange={evt => this.updatePassword(evt)}
                error={this.state.error["password"]}
                helperText={
                  this.state.error["username"] ? (
                    <Translate id="login.required" />
                  ) : null
                }
                margin="normal"
              />
              {this.props.loginFailure && (
                <p>
                  <Translate id="login.failed" />
                </p>
              )}
            </CardContent>
            <CardActions>
              <Button onClick={() => this.register()}>
                <Translate id="login.register" />
              </Button>
              <Button type="submit">
                <Translate id="login.login" />
              </Button>
              <br />
              {this.props.loginAttempt && <CircularProgress size={30} />}
            </CardActions>
          </form>
        </Card>
      </Grid>
    );
  }
}

export default withLocalize(Login);
