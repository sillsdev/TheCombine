import {
  Button,
  Card,
  CardContent,
  Grid,
  TextField,
  Typography,
} from "@material-ui/core";
import React from "react";
import { Translate } from "react-localize-redux";

import { isEmailTaken, isUsernameTaken } from "backend";
import history, { Path } from "browserHistory";
import LoadingDoneButton from "components/Buttons/LoadingDoneButton";
import {
  meetsPasswordRequirements,
  meetsUsernameRequirements,
} from "utilities";

const idAffix = "register";

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

export default class Register extends React.Component<
  RegisterDispatchProps & RegisterStateProps & RegisterProps,
  RegisterState
> {
  constructor(
    props: RegisterProps & RegisterDispatchProps & RegisterStateProps
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
    const search = window.location.search;
    const email = new URLSearchParams(search).get("email");
    if (email) {
      this.setState({ email });
    }
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
    if (
      !meetsUsernameRequirements(this.state.username) ||
      (await isUsernameTaken(username))
    ) {
      this.setState((prevState) => ({
        error: { ...prevState.error, username: true },
      }));
    }
  }

  async checkEmail(username: string) {
    const emailTaken = await isEmailTaken(username);
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
    error.username =
      !meetsUsernameRequirements(username) || (await isUsernameTaken(username));
    error.email = email === "" || (await isEmailTaken(email));
    error.password = !meetsPasswordRequirements(password);
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
    // Intentional weak comparison. props.failureMessage may evaluate to number
    // eslint-disable-next-line eqeqeq
    if (this.props.failureMessage == "400") {
      failureMessage = <Translate id="login.registerFailed" />;
    } else {
      failureMessage = <Translate id="login.networkError" />;
    }

    return (
      <Grid container justifyContent="center">
        <Card style={{ width: 450 }}>
          <form onSubmit={(e) => this.register(e)}>
            <CardContent>
              {/* Title */}
              <Typography variant="h5" align="center" gutterBottom>
                <Translate id="login.registerNew" />
              </Typography>

              {/* Name field */}
              <TextField
                id={`${idAffix}-name`}
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
                id={`${idAffix}-username`}
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
                id={`${idAffix}-email`}
                required
                type="email"
                autoComplete="email"
                label={<Translate id="login.email" />}
                value={this.state.email}
                onChange={(e) => this.updateField(e, "email")}
                onBlur={() =>
                  this.state.email ? this.checkEmail(this.state.email) : null
                }
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
                id={`${idAffix}-password1`}
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
                id={`${idAffix}-password2`}
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
              {!!this.props.failureMessage && (
                <Typography
                  variant="body2"
                  style={{ marginTop: 24, marginBottom: 24, color: "red" }}
                >
                  {failureMessage}
                </Typography>
              )}

              {/* Register and Login buttons */}
              <Grid container justifyContent="flex-end" spacing={2}>
                <Grid item>
                  <Button
                    id={`${idAffix}-login`}
                    type="button"
                    onClick={() => {
                      history.push(Path.Login);
                    }}
                  >
                    <Translate id="login.backToLogin" />
                  </Button>
                </Grid>
                <Grid item>
                  <LoadingDoneButton
                    loading={this.props.inProgress}
                    done={this.props.success}
                    doneText={<Translate id="login.registerSuccess" />}
                    buttonProps={{
                      id: `${idAffix}-register`,
                      color: "primary",
                    }}
                  >
                    <Translate id="login.register" />
                  </LoadingDoneButton>
                </Grid>
              </Grid>
            </CardContent>
          </form>
        </Card>
      </Grid>
    );
  }
}
