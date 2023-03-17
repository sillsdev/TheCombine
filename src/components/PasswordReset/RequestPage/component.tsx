import { Card, Grid, TextField, Typography } from "@mui/material";
import React from "react";
import { withTranslation, WithTranslation } from "react-i18next";

import { isEmailTaken, isUsernameTaken } from "backend";
import history, { Path } from "browserHistory";
import LoadingDoneButton from "components/Buttons/LoadingDoneButton";

export interface ResetRequestDispatchProps {
  passwordResetRequest: (email: string) => void;
}

interface ResetRequestProps
  extends ResetRequestDispatchProps,
    WithTranslation {}

interface ResetRequestState {
  emailOrUsername: string;
  emailOrUsernameExists: boolean;
  loading: boolean;
  done: boolean;
}

export class ResetRequest extends React.Component<
  ResetRequestProps,
  ResetRequestState
> {
  constructor(props: ResetRequestProps) {
    super(props);
    this.state = {
      emailOrUsernameExists: true,
      emailOrUsername: "",
      loading: false,
      done: false,
    };
  }

  onSubmit = (event: React.FormEvent<HTMLElement>) => {
    event.preventDefault();
    this.setState({ loading: true });
    setTimeout(() => this.tryResetRequest(), 1000);
  };

  async tryResetRequest() {
    const emailExists = await isEmailTaken(this.state.emailOrUsername);
    const usernameExists = await isUsernameTaken(this.state.emailOrUsername);
    if (emailExists || usernameExists) {
      this.props.passwordResetRequest(this.state.emailOrUsername);
      this.setState({ done: true, loading: false });
      setTimeout(() => history.push(Path.Login), 1000);
    } else {
      this.setState({ emailOrUsernameExists: false, loading: false });
    }
  }

  setTextField(emailOrUsername: string) {
    this.setState({ emailOrUsername, emailOrUsernameExists: true });
  }

  render() {
    return (
      <div>
        <Grid container justifyContent="center">
          <Card style={{ padding: 10, width: 450 }}>
            <Typography variant="h5" align="center">
              {this.props.t("passwordReset.resetRequestTitle")}
            </Typography>
            <Typography variant="subtitle1" align="center">
              {this.props.t("passwordReset.resetRequestInstructions")}
            </Typography>
            <form onSubmit={this.onSubmit}>
              <Grid item>
                <TextField
                  id="password-reset-request-text"
                  required
                  type="text"
                  variant="outlined"
                  label={this.props.t("passwordReset.emailOrUsername")}
                  value={this.state.emailOrUsername}
                  style={{ width: "100%" }}
                  error={!this.state.emailOrUsernameExists}
                  helperText={
                    !this.state.emailOrUsernameExists &&
                    this.props.t("passwordReset.notFoundError")
                  }
                  margin="normal"
                  onChange={(e) => this.setTextField(e.target.value)}
                />
              </Grid>
              <Grid item>
                <LoadingDoneButton
                  disabled={!this.state.emailOrUsername}
                  loading={this.state.loading}
                  done={this.state.done}
                  buttonProps={{
                    onClick: () => this.onSubmit,
                    variant: "contained",
                    color: "primary",
                    id: "password-reset-request",
                  }}
                >
                  {this.props.t("passwordReset.submit")}
                </LoadingDoneButton>
              </Grid>
            </form>
          </Card>
        </Grid>
      </div>
    );
  }
}

export default withTranslation()(ResetRequest);
