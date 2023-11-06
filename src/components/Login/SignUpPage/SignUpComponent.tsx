import ReCaptcha from "@matt-block/react-recaptcha-v2";
import {
  Button,
  Card,
  CardContent,
  Grid,
  TextField,
  Typography,
} from "@mui/material";
import { Component, ReactElement } from "react";
import { withTranslation, WithTranslation } from "react-i18next";

import router from "browserRouter";
import { LoadingDoneButton } from "components/Buttons";
import { captchaStyle } from "components/Login/LoginPage/LoginComponent";
import { LoginStatus } from "components/Login/Redux/LoginReduxTypes";
import { Path } from "types/path";
import { RuntimeConfig } from "types/runtimeConfig";
import {
  meetsPasswordRequirements,
  meetsUsernameRequirements,
} from "utilities/utilities";

// Chrome silently converts non-ASCII characters in a Textfield of type="email".
// Use punycode.toUnicode() to convert them from punycode back to Unicode.
// eslint-disable-next-line @typescript-eslint/no-var-requires
const punycode = require("punycode/");

const idAffix = "signUp";

interface SignUpDispatchProps {
  signUp?: (
    name: string,
    username: string,
    email: string,
    password: string
  ) => void;
  reset: () => void;
}

export interface SignUpStateProps {
  failureMessage: string;
  status: LoginStatus;
}

interface SignUpProps
  extends SignUpDispatchProps,
    SignUpStateProps,
    WithTranslation {
  returnToEmailInvite?: () => void;
}

interface SignUpState {
  name: string;
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  isVerified: boolean;
  error: {
    name: boolean;
    username: boolean;
    email: boolean;
    password: boolean;
    confirmPassword: boolean;
  };
}

export class SignUp extends Component<SignUpProps, SignUpState> {
  constructor(props: SignUpProps) {
    super(props);
    this.state = {
      name: "",
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      isVerified: !RuntimeConfig.getInstance().captchaRequired(),
      error: {
        name: false,
        username: false,
        email: false,
        password: false,
        confirmPassword: false,
      },
    };
  }

  componentDidMount(): void {
    const search = window.location.search;
    const email = new URLSearchParams(search).get("email");
    if (email) {
      this.setState({ email });
    }
    this.props.reset();
  }

  /** Updates the state to match the value in a textbox */
  updateField<K extends keyof SignUpState>(
    e: React.ChangeEvent<
      HTMLTextAreaElement | HTMLInputElement | HTMLSelectElement
    >,
    field: K
  ): void {
    const value = e.target.value;
    this.setState({ [field]: value } as Pick<SignUpState, K>);
    this.setState((prevState) => ({
      error: { ...prevState.error, [field]: false },
    }));
  }

  async checkUsername(): Promise<void> {
    if (!meetsUsernameRequirements(this.state.username)) {
      this.setState((prevState) => ({
        error: { ...prevState.error, username: true },
      }));
    }
  }

  async signUp(e: React.FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();
    const name = this.state.name.trim();
    const username = this.state.username.trim();
    const email = punycode.toUnicode(this.state.email.trim());
    const password = this.state.password.trim();
    const confirmPassword = this.state.confirmPassword.trim();

    // Error checking.
    const error = { ...this.state.error };
    error.name = name === "";
    error.username = !meetsUsernameRequirements(username);
    error.email = email === "";
    error.password = !meetsPasswordRequirements(password);
    error.confirmPassword = password !== confirmPassword;

    if (Object.values(error).some((e) => e)) {
      this.setState({ error });
    } else if (this.props.signUp) {
      this.props.signUp(name, username, email, password);
      // Temporary solution - Not sure how to force sign up to finish first
      setTimeout(() => {
        if (this.props.returnToEmailInvite) {
          this.props.returnToEmailInvite();
        }
      }, 1050);
    }
  }

  render(): ReactElement {
    return (
      <Grid container justifyContent="center">
        <Card style={{ width: 450 }}>
          <form onSubmit={(e) => this.signUp(e)}>
            <CardContent>
              {/* Title */}
              <Typography variant="h5" align="center" gutterBottom>
                {this.props.t("login.signUpNew")}
              </Typography>

              {/* Name field */}
              <TextField
                id={`${idAffix}-name`}
                required
                autoFocus
                autoComplete="name"
                label={this.props.t("login.name")}
                value={this.state.name}
                onChange={(e) => this.updateField(e, "name")}
                error={this.state.error["name"]}
                helperText={
                  this.state.error["name"]
                    ? this.props.t("login.required")
                    : undefined
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
                label={this.props.t("login.username")}
                value={this.state.username}
                onChange={(e) => this.updateField(e, "username")}
                onBlur={() => this.checkUsername()}
                error={this.state.error["username"]}
                helperText={this.props.t("login.usernameRequirements")}
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
                label={this.props.t("login.email")}
                value={this.state.email}
                onChange={(e) => this.updateField(e, "email")}
                error={this.state.error["email"]}
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
                label={this.props.t("login.password")}
                type="password"
                value={this.state.password}
                onChange={(e) => this.updateField(e, "password")}
                error={this.state.error["password"]}
                helperText={this.props.t("login.passwordRequirements")}
                variant="outlined"
                style={{ width: "100%" }}
                margin="normal"
                inputProps={{ maxLength: 100 }}
              />

              {/* Confirm Password field */}
              <TextField
                id={`${idAffix}-password2`}
                autoComplete="new-password"
                label={this.props.t("login.confirmPassword")}
                type="password"
                value={this.state.confirmPassword}
                onChange={(e) => this.updateField(e, "confirmPassword")}
                error={this.state.error["confirmPassword"]}
                helperText={
                  this.state.error["confirmPassword"]
                    ? this.props.t("login.confirmPasswordError")
                    : undefined
                }
                variant="outlined"
                style={{ width: "100%" }}
                margin="normal"
                inputProps={{ maxLength: 100 }}
              />

              {/* "Failed to sign up" */}
              {!!this.props.failureMessage && (
                <Typography
                  variant="body2"
                  style={{ marginTop: 24, marginBottom: 24, color: "red" }}
                >
                  {this.props.t(this.props.failureMessage)}
                </Typography>
              )}

              {RuntimeConfig.getInstance().captchaRequired() && (
                <div
                  className="form-group"
                  id={`${idAffix}-captcha`}
                  style={captchaStyle}
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

              {/* Sign Up and Login buttons */}
              <Grid container justifyContent="flex-end" spacing={2}>
                <Grid item>
                  <Button
                    id={`${idAffix}-login`}
                    type="button"
                    onClick={() => {
                      router.navigate(Path.Login);
                    }}
                    variant="outlined"
                  >
                    {this.props.t("login.backToLogin")}
                  </Button>
                </Grid>
                <Grid item>
                  <LoadingDoneButton
                    disabled={!this.state.isVerified}
                    loading={this.props.status === LoginStatus.InProgress}
                    done={this.props.status === LoginStatus.Success}
                    doneText={this.props.t("login.signUpSuccess")}
                    buttonProps={{
                      id: `${idAffix}-signUp`,
                      color: "primary",
                    }}
                  >
                    {this.props.t("login.signUp")}
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

export default withTranslation()(SignUp);
