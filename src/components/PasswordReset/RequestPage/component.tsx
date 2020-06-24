import * as React from "react";
import { Translate, LocalizeContextProps } from "react-localize-redux";
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

  onSubmit = (event: React.FormEvent<HTMLElement>) => {
    this.props.passwordResetRequest(this.state.email);
    event.preventDefault();
  };

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
                  variant="outlined"
                  label={<Translate id="passwordReset.emailLabel" />}
                  value={this.state.email}
                  style={{ width: "100%" }}
                  margin="normal"
                  onChange={(e) =>
                    this.setState((prevState) => ({ ...this.state, email: e.target.value }))
                  }
                />
              </Grid>
              <Grid item>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={this.onSubmit}
                >
                  <Translate id="passwordReset.submit" />
                </Button>
              </Grid>
            </form>
          </Card>
        </Grid>
      </div>
    );
  }
}
