import * as React from "react";
import { Translate, LocalizeContextProps } from "react-localize-redux";
import { Typography, Card, Button, Grid, TextField } from "@material-ui/core";
import { isEmailTaken } from "../../../backend";
import LoadingDoneButton from "../../Buttons/LoadingDoneButton";

export interface ResetRequestProps {}

export interface ResetRequestDispatchProps {
  passwordResetRequest: (email: string) => void;
}

export interface ResetRequestState {
  email: string;
  emailExists: boolean;
  loading: boolean;
  done: boolean;
}

export default class ResetRequest extends React.Component<
  ResetRequestProps & ResetRequestDispatchProps & LocalizeContextProps,
  ResetRequestState
> {
  constructor(
    props: ResetRequestProps & ResetRequestDispatchProps & LocalizeContextProps
  ) {
    super(props);
    this.state = { emailExists: true, email: "", loading: false, done: false };
  }

  onSubmit = (event: React.FormEvent<HTMLElement>) => {
    event.preventDefault();
    this.setState({
      loading: true,
    });
    isEmailTaken(this.state.email)
      .then((emailExists: boolean) => {
        if (emailExists) {
          this.props.passwordResetRequest(this.state.email);
        }
        return emailExists;
      })
      .then((emailExists: boolean) => {
        if (!emailExists) {
          this.setState({
            emailExists: false,
            loading: false,
          });
        } else {
          this.setState({
            done: true,
            loading: false,
          });
        }
      });
  };

  async setEmail(email: string) {
    this.setState((prevState) => ({
      ...prevState,
      email: email,
      emailExists: true,
    }));
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
                  type="email"
                  autoComplete="email"
                  variant="outlined"
                  label={<Translate id="login.email" />}
                  value={this.state.email}
                  style={{ width: "100%" }}
                  error={!this.state.emailExists}
                  helperText={
                    !this.state.emailExists && (
                      <Translate id="passwordReset.emailError" />
                    )
                  }
                  margin="normal"
                  onChange={(e) => this.setEmail(e.target.value)}
                />
              </Grid>
              <Grid item>
                <LoadingDoneButton
                  variant="contained"
                  color="primary"
                  onClick={() => this.onSubmit}
                  disabled={!this.state.email}
                  loading={this.state.loading}
                  done={this.state.done}
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
