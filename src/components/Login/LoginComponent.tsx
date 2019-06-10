//external modules
import * as React from "react";
import {
  Translate,
  LocalizeContextProps,
  withLocalize
} from "react-localize-redux";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import { Grid } from "@material-ui/core";

export interface LoginDispatchProps {
  login?: (user: string, password: string) => void;
  logout: () => void;
  register?: (user: string, password: string) => void;
}

export interface LoginStateProps {
  loginAttempt: boolean | undefined;
}

interface LoginState {
  user: string;
  password: string;
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
    this.state = { user: "", password: "" };
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
    this.setState({ password, user });
  }

  login(e: React.FormEvent<EventTarget>) {
    e.preventDefault();

    var user = this.state.user.trim();
    var pass = this.state.password.trim();
    if (user === "" || pass === "") {
      // notify the user they need both a username and password
      alert("Username and password cannot be blank");
    } else if (this.props.login) {
      this.props.login(user, pass);
    }
  }

  register() {
    var user = this.state.user.trim();
    var pass = this.state.password.trim();
    if (user === "" || pass === "") {
      // notify the user they need both a username and password
      alert("Username and password cannot be blank");
    } else if (this.props.register) {
      this.props.register(user, pass);
    }
  }

  render() {
    //visual definition
    return (
      <Grid container justify="center">
        <form onSubmit={evt => this.login(evt)}>
          <TextField
            label={<Translate id="login.username" />}
            value={this.state.user}
            onChange={evt => this.updateUser(evt)}
          />
          <br />
          <TextField
            label={<Translate id="login.password" />}
            type="password"
            value={this.state.password}
            onChange={evt => this.updatePassword(evt)}
          />
          <br />
          <Button onClick={() => this.register()}>
            <Translate id="login.register" />
          </Button>
          <Button type="submit">
            <Translate id="login.login" />
          </Button>
          <br />
          {this.props.loginAttempt && <p>Logging in...</p>}
        </form>
      </Grid>
    );
  }
}

export default withLocalize(Login);
