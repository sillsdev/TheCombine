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
import validator from "validator";

interface InviteProps {}

interface InviteState {
  emailAddress: string;
  isValid: boolean;
}
class EmailInvite extends React.Component<InviteProps, InviteState> {
  constructor(props: InviteProps) {
    super(props);
    this.state = {
      emailAddress: "",
      isValid: false,
    };
  }

  onSubmit = () => {
    console.warn(
      "Should send the message to the corresponding email and show if it was succesful or not."
    );
  };

  /** Updates the state to match the value in a textbox */
  updateField(
    e: React.ChangeEvent<
      HTMLTextAreaElement | HTMLInputElement | HTMLSelectElement
    >
  ) {
    const value = e.target.value;
    this.setState({
      emailAddress: value,
    });
    if (
      validator.isEmail(this.state.emailAddress) &&
      this.state.emailAddress !== "example@gmail.com"
    ) {
      this.setState({ isValid: true });
    } else {
      this.setState({ isValid: false });
    }
  }

  render() {
    return (
      <React.Fragment>
        <Grid container justify="center">
          <Card style={{ width: 450 }}>
            <CardContent>
              <Typography variant="h5" align="center" gutterBottom>
                <Translate id="projectSettings.invite.inviteByEmailLabel" />
              </Typography>
              <TextField
                required
                label={<Translate id="projectSettings.invite.emailLabel" />}
                onChange={(e) => this.updateField(e)}
                variant="outlined"
                style={{ width: "100%" }}
                margin="normal"
                autoFocus
                inputProps={{ maxLength: 100 }}
              />
              <TextField
                label="Message"
                variant="outlined"
                style={{ width: "100%" }}
                margin="normal"
              ></TextField>
              <Grid container justify="flex-end" spacing={2}>
                <Grid item>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={this.onSubmit}
                    disabled={!this.state.isValid}
                  >
                    <Translate id="projectSettings.invite.inviteButton" />
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </React.Fragment>
    );
  }
}

export default EmailInvite;
