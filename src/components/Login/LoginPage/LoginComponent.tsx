import {
  Button,
  Card,
  CardContent,
  CircularProgress,
  Grid,
  Link,
  TextField,
  Typography,
} from "@material-ui/core";
import { Help } from "@material-ui/icons";
import ReCaptcha from "@matt-block/react-recaptcha-v2";
import * as React from "react";
import {
  LocalizeContextProps,
  Translate,
  withLocalize,
} from "react-localize-redux";

import history, { Path } from "browserHistory";
import { RuntimeConfig } from "types/runtimeConfig";

export interface LoginDispatchProps {
  login?: (username: string, password: string) => void;
  logout: () => void;
  reset: () => void;
}

export interface LoginStateProps {
  loginAttempt: boolean | undefined;
  loginFailure: boolean | undefined;
}

interface LoginState {
  username: string;
  password: string;
  isVerified: boolean;
  error: LoginError;
}

interface LoginError {
  username: boolean;
  password: boolean;
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
      username: "",
      password: "",
      isVerified: !RuntimeConfig.getInstance().captchaRequired(),
      error: { username: false, password: false },
    };
  }

  captchaStyle = {
    margin: "5px",
  };

  componentDidMount() {
    this.props.reset();
  }

  /** Updates the state to match the value in a textbox */
  updateField<K extends keyof LoginState>(
    e: React.ChangeEvent<
      HTMLTextAreaElement | HTMLInputElement | HTMLSelectElement
    >,
    field: K
  ) {
    const value = e.target.value;

    this.setState({
      [field]: value,
    } as Pick<LoginState, K>);
  }

  login(e: React.FormEvent<EventTarget>) {
    e.preventDefault();

    const username: string = this.state.username.trim();
    const password: string = this.state.password.trim();
    let error = { ...this.state.error };
    error.username = username === "";
    error.password = password === "";
    if (error.username || error.password) {
      this.setState({ error });
    } else if (this.props.login) {
      this.props.login(username, password);
    }
  }

  render() {
    return (
      <Grid container justify="center">
        <Card style={{ width: 450 }}>
          <form onSubmit={(e) => this.login(e)}>
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
                value={this.state.username}
                onChange={(e) => this.updateField(e, "username")}
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
                inputProps={{ maxLength: 100 }}
              />

              {/* Password field */}
              <TextField
                required
                autoComplete="current-password"
                label={<Translate id="login.password" />}
                type="password"
                value={this.state.password}
                onChange={(e) => this.updateField(e, "password")}
                error={this.state.error["password"]}
                helperText={
                  this.state.error["password"] ? (
                    <Translate id="login.required" />
                  ) : null
                }
                variant="outlined"
                style={{ width: "100%" }}
                margin="normal"
                inputProps={{ maxLength: 100 }}
              />

              {/* "Forgot password?" link to reset password */}
              <Typography>
                <Link
                  href={"#"}
                  onClick={() => history.push(Path.PwRequest)}
                  variant="subtitle2"
                >
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

              {RuntimeConfig.getInstance().captchaRequired() && (
                <div
                  className="form-group"
                  id="captcha-holder"
                  style={this.captchaStyle}
                >
                  <ReCaptcha
                    siteKey={RuntimeConfig.getInstance().captchaSiteKey()}
                    theme="light"
                    size="normal"
                    onSuccess={(captcha) => this.setState({ isVerified: true })}
                    onExpire={() => this.setState({ isVerified: false })}
                    onError={() =>
                      console.log("Something went wrong, check your conenction")
                    }
                  />
                </div>
              )}

              {/* Register and Login buttons */}
              <Grid container justify="flex-end" spacing={2}>
                <Grid item xs={4} sm={6}>
                  <Button
                    onClick={() => {
                      // This link does not work in development, but should in production.
                      window.open(`docs`);
                    }}
                  >
                    <Help />
                  </Button>
                </Grid>

                <Grid item xs={4} sm={3}>
                  <Button
                    onClick={() => {
                      history.push(Path.Register);
                    }}
                  >
                    <Translate id="login.register" />
                  </Button>
                </Grid>

                <Grid item xs={4} sm={3}>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    disabled={!this.state.isVerified}
                  >
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
