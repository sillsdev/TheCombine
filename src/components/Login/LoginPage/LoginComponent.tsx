import {
  Button,
  Card,
  CardContent,
  Grid,
  Link,
  TextField,
  Typography,
} from "@material-ui/core";
import { Help } from "@material-ui/icons";
import ReCaptcha from "@matt-block/react-recaptcha-v2";
import React from "react";
import { Translate } from "react-localize-redux";

import { BannerType } from "api/models";
import { getBannerText } from "backend";
import history, { openUserGuide, Path } from "browserHistory";
import LoadingButton from "components/Buttons/LoadingButton";
import { RuntimeConfig } from "types/runtimeConfig";
import theme from "types/theme";

const idAffix = "login";

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
  loginBanner: string;
}

interface LoginError {
  username: boolean;
  password: boolean;
}

/** The login page (also doubles as a logout page) */
export default class Login extends React.Component<
  LoginDispatchProps & LoginStateProps,
  LoginState
> {
  constructor(props: LoginDispatchProps & LoginStateProps) {
    super(props);
    this.props.logout(); // Loading this page will reset the app, both store and localStorage

    this.state = {
      username: "",
      password: "",
      isVerified: !RuntimeConfig.getInstance().captchaRequired(),
      error: { username: false, password: false },
      loginBanner: "",
    };
  }

  captchaStyle = {
    margin: "5px",
  };

  componentDidMount() {
    this.props.reset();
    getBannerText(BannerType.Login).then((loginBanner) =>
      this.setState({ loginBanner })
    );
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
      <Grid container justifyContent="center">
        <Card style={{ width: 450 }}>
          <form onSubmit={(e) => this.login(e)}>
            <CardContent>
              {/* Title */}
              <Typography variant="h5" align="center" gutterBottom>
                <Translate id="login.title" />
              </Typography>

              {/* Username field */}
              <TextField
                id={`${idAffix}-username`}
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
                id={`${idAffix}-password`}
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
              {RuntimeConfig.getInstance().emailServicesEnabled() && (
                <Typography>
                  <Link
                    href={"#"}
                    onClick={() => history.push(Path.PwRequest)}
                    variant="subtitle2"
                  >
                    <Translate id="login.forgotPassword" />
                  </Link>
                </Typography>
              )}

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
                  id={`${idAffix}-captcha`}
                  style={this.captchaStyle}
                >
                  <ReCaptcha
                    siteKey={RuntimeConfig.getInstance().captchaSiteKey()}
                    theme="light"
                    size="normal"
                    onSuccess={() => this.setState({ isVerified: true })}
                    onExpire={() => this.setState({ isVerified: false })}
                    onError={() =>
                      console.error(
                        "Something went wrong, check your connection."
                      )
                    }
                  />
                </div>
              )}

              {/* User Guide, Register, and Login buttons */}
              <Grid container justifyContent="flex-end" spacing={2}>
                <Grid item xs={4} sm={6}>
                  <Button id={`${idAffix}-guide`} onClick={openUserGuide}>
                    <Help />
                  </Button>
                </Grid>

                <Grid item xs={4} sm={3}>
                  <Button
                    id={`${idAffix}-register`}
                    onClick={() => {
                      history.push(Path.Register);
                    }}
                  >
                    <Translate id="login.register" />
                  </Button>
                </Grid>

                <Grid item xs={4} sm={3}>
                  <LoadingButton
                    buttonProps={{
                      id: `${idAffix}-login`,
                      type: "submit",
                      color: "primary",
                    }}
                    disabled={!this.state.isVerified}
                    loading={this.props.loginAttempt}
                  >
                    <Translate id="login.login" />
                  </LoadingButton>
                </Grid>
              </Grid>

              {/* Login announcement banner */}
              {!!this.state.loginBanner && (
                <Typography
                  style={{
                    marginTop: theme.spacing(2),
                    padding: theme.spacing(1),
                  }}
                >
                  {this.state.loginBanner}
                </Typography>
              )}
            </CardContent>
          </form>
        </Card>
      </Grid>
    );
  }
}
