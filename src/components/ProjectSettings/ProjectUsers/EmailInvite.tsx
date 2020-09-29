import {
  Card,
  CardContent,
  Grid,
  TextField,
  Typography,
} from "@material-ui/core";
import React from "react";
import { Translate } from "react-localize-redux";
import validator from "validator";
import LoadingDoneButton from "../../Buttons/LoadingDoneButton";
import * as Backend from "../../../backend";
import * as LocalStorage from "../../../backend/localStorage";

interface InviteProps {
  close: () => void;
}

interface InviteState {
  emailAddress: string;
  message: string;
  isValid: boolean;
  loading: boolean;
  done: boolean;
}
class EmailInvite extends React.Component<InviteProps, InviteState> {
  constructor(props: InviteProps) {
    super(props);
    this.state = {
      emailAddress: "",
      message: "",
      isValid: false,
      loading: false,
      done: false,
    };
  }

  async onSubmit() {
    this.setState({
      loading: true,
    });
    var projectId = LocalStorage.getProjectId();
    await Backend.emailInviteToProject(
      projectId,
      this.state.emailAddress,
      this.state.message
    );
    this.setState({
      loading: false,
      done: true,
    });
    this.props.close();
  }

  /** Updates the state to match the value in a textbox */
  updateEmailField(
    e: React.ChangeEvent<
      HTMLTextAreaElement | HTMLInputElement | HTMLSelectElement
    >
  ) {
    const emailAddress = e.target.value;
    const isValid =
      validator.isEmail(emailAddress) && emailAddress !== "example@gmail.com";
    this.setState({ emailAddress, isValid });
  }

  updateMessageField(
    e: React.ChangeEvent<
      HTMLTextAreaElement | HTMLInputElement | HTMLSelectElement
    >
  ) {
    const message = e.target.value;
    this.setState({ message });
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
                onChange={(e) => this.updateEmailField(e)}
                variant="outlined"
                style={{ width: "100%" }}
                margin="normal"
                autoFocus
                inputProps={{ maxLength: 100 }}
              />
              <TextField
                label="Message"
                onChange={(e) => this.updateMessageField(e)}
                variant="outlined"
                style={{ width: "100%" }}
                margin="normal"
              ></TextField>
              <Grid container justify="flex-end" spacing={2}>
                <Grid item>
                  <LoadingDoneButton
                    variant="contained"
                    color="primary"
                    onClick={() => this.onSubmit()}
                    disabled={!this.state.isValid}
                    loading={this.state.loading}
                    done={this.state.done}
                  >
                    <Translate id="buttons.invite" />
                  </LoadingDoneButton>
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
