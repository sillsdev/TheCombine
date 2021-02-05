import {
  Button,
  Card,
  CardContent,
  CircularProgress,
  Grid,
  TextField,
  Typography,
} from "@material-ui/core";
import { Check } from "@material-ui/icons";
import * as React from "react";
import {
  LocalizeContextProps,
  Translate,
  withLocalize,
} from "react-localize-redux";

import { isEmailTaken, isUsernameTaken } from "backend";
import history, { Path } from "browserHistory";
import { buttonSuccess } from "types/theme";
import { passwordRequirements, usernameRequirements } from "utilities";

interface RegisterDispatchProps {
  register?: (
    name: string,
    username: string,
    email: string,
    password: string
  ) => void;
  reset: () => void;
}

export interface RegisterStateProps {
  inProgress: boolean;
  success: boolean;
  failureMessage: string;
}

interface RegisterProps {
  returnToEmailInvite?: () => void;
}

interface RegisterState {
  name: string;
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  error: {
    name: boolean;
    username: boolean;
    email: boolean;
    password: boolean;
    confirmPassword: boolean;
  };
}

export class Register extends React.Component<
  RegisterDispatchProps &
    RegisterStateProps &
    RegisterProps &
    LocalizeContextProps,
  RegisterState
> {
  constructor(
    props: RegisterProps &
      RegisterDispatchProps &
      RegisterStateProps &
      LocalizeContextProps
  ) {
    super(props);
    this.state = {
      name: "",
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      error: {
        name: false,
        username: false,
        email: false,
        password: false,
        confirmPassword: false,
      },
    };
  }

  componentDidMount() {
    this.props.reset();
  }

  /** Updates the state to match the value in a textbox */
  updateField<K extends keyof RegisterState>(
    e: React.ChangeEvent<
      HTMLTextAreaElement | HTMLInputElement | HTMLSelectElement
    >,
    field: K
  ) {
    const value = e.target.value;
    this.setState({ [field]: value } as Pick<RegisterState, K>);
    this.setState((prevState) => ({
      error: { ...prevState.error, [field]: false },
    }));
  }

  async checkUsername(username: string) {
    const usernameTaken: boolean = await isUsernameTaken(username);
    if (usernameTaken) {
      this.setState((prevState) => ({
        error: { ...prevState.error, username: true },
      }));
    }
  }

  async checkEmail(username: string) {
    const emailTaken: boolean = await isEmailTaken(username);
    if (emailTaken) {
      this.setState((prevState) => ({
        error: { ...prevState.error, email: true },
      }));
    }
  }

  async register(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const name = this.state.name.trim();
    const username = this.state.username.trim();
    const email = this.state.email.trim();
    const password = this.state.password.trim();
    const confirmPassword = this.state.confirmPassword.trim();

    // Error checking.
    const error = { ...this.state.error };
    error.name = name === "";
    error.username = !usernameRequirements(username);
    error.email = email === "";
    error.password = !passwordRequirements(password);
    error.confirmPassword = password !== confirmPassword;

    if (Object.values(error).some((e) => e)) {
      this.setState({ error });
    } else if (this.props.register) {
      this.props.register(name, username, email, password);
      // Temporary solution - Not sure how to force register to finish first
      setTimeout(() => {
        if (this.props.returnToEmailInvite) {
          this.props.returnToEmailInvite();
        }
      }, 1050);
    }
  }

  render() {
    // Determine error message
    let failureMessage;
    // Intentional weak comparision. props.failureMessage may evaluate to number
    // eslint-disable-next-line eqeqeq
    if (this.props.failureMessage == "400") {
      failureMessage = <Translate id="login.registerFailed" />;
    } else {
      failureMessage = <Translate id="login.networkError" />;
    }

    return (
      <Grid container justify="center">
        <Card style={{ width: 450 }}>
          <form onSubmit={(e) => this.register(e)}>
            <CardContent>
              {/* Title */}
              <Typography variant="h5" align="center" gutterBottom>
                <Translate id="login.registerNew" />
              </Typography>

              {/* Name field */}
              <TextField
                required
                autoFocus
                autoComplete="name"
                label={<Translate id="login.name" />}
                value={this.state.name}
                onChange={(e) => this.updateField(e, "name")}
                error={this.state.error["name"]}
                helperText={
                  this.state.error["name"] ? (
                    <Translate id="login.required" />
                  ) : null
                }
                variant="outlined"
                style={{ width: "100%" }}
                margin="normal"
                inputProps={{ maxLength: 100 }}
              />

              {/* Username field */}
              <TextField
                required
                autoComplete="username"
                label={<Translate id="login.username" />}
                value={this.state.username}
                onChange={(e) => this.updateField(e, "username")}
                onBlur={() => this.checkUsername(this.state.username)}
                error={this.state.error["username"]}
                helperText={
                  this.state.error["username"] ? (
                    <Translate id="login.usernameInvalid" />
                  ) : (
                    <Translate id="login.usernameRequirements" />
                  )
                }
                variant="outlined"
                style={{ width: "100%" }}
                margin="normal"
                inputProps={{ maxLength: 100 }}
              />

              {/* email field */}
              <TextField
                required
                type="email"
                autoComplete="email"
                label={<Translate id="login.email" />}
                value={this.state.email}
                onChange={(e) => this.updateField(e, "email")}
                onBlur={() => this.checkEmail(this.state.email)}
                error={this.state.error["email"]}
                helperText={
                  this.state.error["email"] ? (
                    <Translate id="login.emailTaken" />
                  ) : null
                }
                variant="outlined"
                style={{ width: "100%" }}
                margin="normal"
                inputProps={{ maxLength: 100 }}
              />

              {/* Password field */}
              <TextField
                required
                autoComplete="new-password"
                label={<Translate id="login.password" />}
                type="password"
                value={this.state.password}
                onChange={(e) => this.updateField(e, "password")}
                error={this.state.error["password"]}
                helperText={
                  this.state.error["password"] ? (
                    <Translate id="login.passwordRequirements" />
                  ) : (
                    <Translate id="login.passwordRequirements" />
                  )
                }
                variant="outlined"
                style={{ width: "100%" }}
                margin="normal"
                inputProps={{ maxLength: 100 }}
              />

              {/* Confirm Password field */}
              <TextField
                autoComplete="new-password"
                label={<Translate id="login.confirmPassword" />}
                type="password"
                value={this.state.confirmPassword}
                onChange={(e) => this.updateField(e, "confirmPassword")}
                error={this.state.error["confirmPassword"]}
                helperText={
                  this.state.error["confirmPassword"] ? (
                    <Translate id="login.confirmPasswordError" />
                  ) : null
                }
                variant="outlined"
                style={{ width: "100%" }}
                margin="normal"
                inputProps={{ maxLength: 100 }}
              />

              {/* "Failed to register" */}
              {this.props.failureMessage !== "" && (
                <Typography
                  variant="body2"
                  style={{ marginTop: 24, marginBottom: 24, color: "red" }}
                >
                  {failureMessage}
                </Typography>
              )}

              {/* Register and Login buttons */}
              <Grid container justify="flex-end" spacing={2}>
                <Grid item>
                  <Button
                    type="button"
                    onClick={() => {
                      history.push(Path.Login);
                    }}
                  >
                    <Translate id="login.backToLogin" />
                  </Button>
                </Grid>
                <Grid item>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    disabled={this.props.inProgress}
                    style={{
                      backgroundColor: this.props.success
                        ? buttonSuccess
                        : undefined,
                    }}
                  >
                    {this.props.success ? (
                      <React.Fragment>
                        <Check />
                        <Translate id="login.registerSuccess" />
                      </React.Fragment>
                    ) : (
                      <Translate id="login.register" />
                    )}
                    {this.props.inProgress && (
                      <CircularProgress
                        size={24}
                        style={{
                          color: buttonSuccess,
                          position: "absolute",
                          top: "50%",
                          left: "50%",
                          marginTop: -12,
                          marginLeft: -12,
                        }}
                      />
                    )}
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
