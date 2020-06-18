import * as React from "react";
import {
  Translate,
  LocalizeContextProps,
  withLocalize,
} from "react-localize-redux";
import { Typography, Card, Button, Grid, TextField } from "@material-ui/core";

export interface ResetRequestProps {}

export interface ResetRequestDispatchProps {
  passwordResetRequest: (email: string) => void;
}

export interface ResetRequestState {
  email: string;
}

export default class ResetRequest extends React.Component<
  ResetRequestProps & ResetRequestDispatchProps & LocalizeContextProps,
  ResetRequestState
> {
  constructor(
    props: ResetRequestProps & ResetRequestDispatchProps & LocalizeContextProps
  ) {
    super(props);
    this.state = { email: "" };
  }

  render() {
    return (
      <div>
        <Grid container justify="center">
          <Card style={{ padding: 10, width: 450 }}>
            <Typography variant="h5" align="center">
              Reset Password Request
            </Typography>
            <Typography variant="subtitle1" align="center">
              We will send a one time reset link for your account to your email
            </Typography>
            <form
              onSubmit={() => this.props.passwordResetRequest(this.state.email)}
            >
              <Grid item>
                <TextField
                  variant="outlined"
                  label="Email address"
                  value={this.state.email}
                  style={{ width: "100%" }}
                  margin="normal"
                  onChange={(e) =>
                    this.setState({ ...this.state, email: e.target.value })
                  }
                />
              </Grid>
              <Grid item>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() =>
                    this.props.passwordResetRequest(this.state.email)
                  }
                >
                  Submit
                </Button>
              </Grid>
            </form>
          </Card>
        </Grid>
      </div>
    );
  }
}
