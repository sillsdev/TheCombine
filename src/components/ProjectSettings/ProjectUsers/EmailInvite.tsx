import {
  Button,
  Card,
  CardContent,
  Grid,
  TextField,
  Typography,
} from "@material-ui/core";
import React from "react";
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
      emailAddress: "example@gmail.com",
      isValid: false,
    };
    this.onSubmit = this.onSubmit.bind(this);
  }

  onSubmit() {
    console.log("onSubmit");
  }

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
            <form onSubmit={(e) => {}}>
              <CardContent>
                <Typography variant="h5" align="center" gutterBottom>
                  Invite
                </Typography>
                <TextField
                  required
                  label="Email"
                  onChange={(e) => this.updateField(e)}
                  variant="outlined"
                  style={{ width: "100%" }}
                  margin="normal"
                  autoFocus
                  inputProps={{ maxLength: 100 }}
                />
                <CardContent>
                  <TextField
                    label="Message"
                    variant="outlined"
                    style={{ width: "100%" }}
                    margin="normal"
                    value="Put your message here"
                  ></TextField>
                </CardContent>
                {/* Register and Login buttons */}
                <Grid container justify="flex-end" spacing={2}>
                  <Grid item>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={this.onSubmit}
                      disabled={!this.state.isValid}
                    >
                      Invite
                    </Button>
                  </Grid>

                  <br />
                </Grid>
              </CardContent>
            </form>
          </Card>
        </Grid>
      </React.Fragment>
    );
  }
}

export default EmailInvite;
