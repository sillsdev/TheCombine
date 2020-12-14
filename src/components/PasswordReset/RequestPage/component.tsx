import { Card, Grid, TextField, Typography } from "@material-ui/core";
import * as React from "react";
import { LocalizeContextProps, Translate } from "react-localize-redux";

import { isEmailTaken, isUsernameTaken } from "../../../backend";
import history, { Path } from "../../../history";
import LoadingDoneButton from "../../Buttons/LoadingDoneButton";

export interface ResetRequestDispatchProps {
  passwordResetRequest: (email: string) => void;
}

export interface ResetRequestState {
  emailOrUsername: string;
  emailOrUsernameExists: boolean;
  loading: boolean;
  done: boolean;
}

export default class ResetRequest extends React.Component<
  ResetRequestDispatchProps & LocalizeContextProps,
  ResetRequestState
> {
  constructor(props: ResetRequestDispatchProps & LocalizeContextProps) {
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
        <Grid container justify="center">
          <Card style={{ padding: 10, width: 450 }}>
            <Typography variant="h5" align="center">
              <Translate id="passwordReset.resetRequestTitle" />
            </Typography>
            <Typography variant="subtitle1" align="center">
              <Translate id="passwordReset.resetRequestInstructions" />
            </Typography>
            <form onSubmit={this.onSubmit}>
              <Grid item>
                <TextField
                  required
                  type="text"
                  variant="outlined"
                  label={<Translate id="passwordReset.emailOrUsername" />}
                  value={this.state.emailOrUsername}
                  style={{ width: "100%" }}
                  error={!this.state.emailOrUsernameExists}
                  helperText={
                    !this.state.emailOrUsernameExists && (
                      <Translate id="passwordReset.notFoundError" />
                    )
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
                  }}
                >
                  <Translate id="passwordReset.submit" />
                </LoadingDoneButton>
              </Grid>
            </form>
          </Card>
        </Grid>
      </div>
    );
  }
}
