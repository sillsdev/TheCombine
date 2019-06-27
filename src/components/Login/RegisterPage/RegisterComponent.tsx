//external modules
import * as React from "react";
import {
  Translate,
  LocalizeContextProps,
  withLocalize
} from "react-localize-redux";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import { Grid, Card, CardContent, Typography } from "@material-ui/core";

export interface RegisterDispatchProps {
  register?: (name: string, user: string, password: string) => void;
}

export interface RegisterStateProps {
  registerFailure: boolean | undefined;
}

interface RegisterState {
  name: string;
  user: string;
  password: string;
  confirmPassword: string;
  email: string;
  error: {
    password: boolean;
    username: boolean;
    confirmPassword: boolean;
    name: boolean;
    email: boolean;
  };
}

class Register extends React.Component<
  RegisterDispatchProps & RegisterStateProps & LocalizeContextProps,
  RegisterState
> {
  constructor(
    props: RegisterDispatchProps & RegisterStateProps & LocalizeContextProps
  ) {
    super(props);
    this.state = {
      name: "",
      user: "",
      password: "",
      confirmPassword: "",
      email: "",
      error: {
        password: false,
        username: false,
        confirmPassword: false,
        name: false,
        email: false
      }
    };
  }

  updateName(
    evt: React.ChangeEvent<
      HTMLTextAreaElement | HTMLInputElement | HTMLSelectElement
    >
  ) {
    const name = evt.target.value;
    const error = { ...this.state.error, username: false };
    this.setState({ name, error });
  }

  updateUser(
    evt: React.ChangeEvent<
      HTMLTextAreaElement | HTMLInputElement | HTMLSelectElement
    >
  ) {
    const user = evt.target.value;
    const error = { ...this.state.error, username: false };
    this.setState({ user, error });
  }

  updateEmail(
    evt: React.ChangeEvent<
      HTMLTextAreaElement | HTMLInputElement | HTMLSelectElement
    >
  ) {
    const email = evt.target.value;
    const error = { ...this.state.error, email: false };
    this.setState({ email, error });
  }

  updatePassword(
    e: React.ChangeEvent<
      HTMLTextAreaElement | HTMLInputElement | HTMLSelectElement
    >
  ) {
    const password = e.target.value;
    const error = { ...this.state.error, password: false };
    this.setState({ password, error });
  }

  updateConfirmPassword(
    e: React.ChangeEvent<
      HTMLTextAreaElement | HTMLInputElement | HTMLSelectElement
    >
  ) {
    const confirmPassword = e.target.value;
    const error = { ...this.state.error, password: false };
    this.setState({ confirmPassword, error });
  }

  register(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    let name = this.state.name.trim();
    let user = this.state.user.trim();
    let email = this.state.email.trim();
    let pass = this.state.password.trim();
    let confPass = this.state.confirmPassword.trim();

    // error checking
    let error = { ...this.state.error };
    error.name = name === "";
    error.password = pass === "";
    error.username = user === "";
    error.confirmPassword = pass !== confPass;
    error.email = email === "";

    if (
      error.name ||
      error.password ||
      error.username ||
      error.confirmPassword ||
      error.email
    ) {
      this.setState({ error });
    } else if (this.props.register) {
      this.props.register(name, user, pass);
    }
  }

  render() {
    return (
      <Grid container justify="center">
        <Card style={{ width: 450 }}>
          <form onSubmit={e => this.register(e)}>
            <CardContent>
              {/* Title */}
              <Typography variant="h5" align="center" gutterBottom>
                <Translate id="login.registerNew" />
              </Typography>

              {/* Name field */}
              <TextField
                required
                autoComplete="name"
                label={<Translate id="login.name" />}
                value={this.state.name}
                onChange={e => this.updateName(e)}
                error={this.state.error["name"]}
                helperText={
                  this.state.error["name"] ? (
                    <Translate id="login.required" />
                  ) : null
                }
                variant="outlined"
                style={{ width: "100%" }}
                margin="normal"
              />

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
              />

              {/* email field */}
              <TextField
                required
                type="email"
                autoComplete="email"
                label={<Translate id="login.email" />}
                value={this.state.email}
                onChange={e => this.updateEmail(e)}
                error={this.state.error["email"]}
                helperText={
                  this.state.error["email"] ? (
                    <Translate id="login.emailError" />
                  ) : null
                }
                variant="outlined"
                style={{ width: "100%" }}
                margin="normal"
              />

              {/* Password field */}
              <TextField
                required
                autoComplete="new-password"
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

              {/* Confirm Password field */}
              <TextField
                autoComplete="new-password"
                label={<Translate id="login.confirmPassword" />}
                type="password"
                value={this.state.confirmPassword}
                onChange={e => this.updateConfirmPassword(e)}
                error={this.state.error["confirmPassword"]}
                helperText={
                  this.state.error["confirmPassword"] ? (
                    <Translate id="login.confirmPasswordError" />
                  ) : null
                }
                variant="outlined"
                style={{ width: "100%" }}
                margin="normal"
              />

              {/* "Failed to register" */}
              {this.props.registerFailure && (
                <Typography
                  variant="body2"
                  style={{ marginTop: 24, marginBottom: 24, color: "red" }}
                >
                  <Translate id="login.registerFailed" />
                </Typography>
              )}

              {/* Register and Login buttons */}
              <Grid container justify="flex-end" spacing={2}>
                <Grid item>
                  <Button type="submit" variant="contained" color="primary">
                    <Translate id="login.register" />
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </form>
        </Card>
      </Grid>
    );
  }
}

export default withLocalize(Register);
