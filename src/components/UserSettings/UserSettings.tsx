import {
  Avatar,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogContent,
  DialogTitle,
  Grid,
  makeStyles,
  TextField,
  Typography,
} from "@material-ui/core";
import { CameraAlt, Email, Person, Phone } from "@material-ui/icons";
import React from "react";
import { withTranslation, WithTranslation } from "react-i18next";

import { User } from "api/models";
import { isEmailTaken, updateUser } from "backend";
import { getAvatar, getCurrentUser } from "backend/localStorage";
import PositionedSnackbar from "components/SnackBar/SnackBar";
import AvatarUpload from "components/UserSettings/AvatarUpload";
import theme from "types/theme";
import { newUser } from "types/user";

const idAffix = "user-settings";

function AvatarDialog(props: { open: boolean; onClose?: () => void }) {
  return (
    <Dialog onClose={props.onClose} open={props.open}>
      <DialogTitle>Set user avatar</DialogTitle>
      <DialogContent>
        <AvatarUpload doneCallback={props.onClose} />
      </DialogContent>
    </Dialog>
  );
}

/** An avatar with a camera icon when hovered */
function ClickableAvatar(props: { avatar?: string; onClick: () => void }) {
  const classes = makeStyles({
    avatar: {
      width: 60,
      height: 60,
    },
    avatarOverlay: {
      transition: "opacity 0.2s",
      "&:hover": {
        opacity: 0.9,
      },
      position: "absolute",
      width: 60,
      height: 60,
      top: 0,
      opacity: 0,
      cursor: "pointer",
    },
  })();

  return (
    <div style={{ position: "relative" }}>
      {props.avatar ? (
        <Avatar
          className={classes.avatar}
          alt="User avatar"
          src={props.avatar}
        />
      ) : (
        <Person style={{ fontSize: 60 }} />
      )}
      <Avatar className={classes.avatarOverlay} onClick={props.onClick}>
        <CameraAlt />
      </Avatar>
    </div>
  );
}

interface UserSettingsState {
  user: User;
  name: string;
  phone: string;
  email: string;
  emailTaken: boolean;
  avatar: string;
  avatarDialogOpen: boolean;
  toastOpen: boolean;
  toastMessage: string;
}

/**
 * A page to edit a user's details
 */
class UserSettings extends React.Component<WithTranslation, UserSettingsState> {
  constructor(props: WithTranslation) {
    super(props);
    const potentialUser = getCurrentUser();
    const user = potentialUser ?? newUser();
    this.state = {
      user: user,
      name: user.name,
      phone: user.phone,
      email: user.email,
      emailTaken: false,
      avatar: getAvatar(),
      avatarDialogOpen: false,
      toastOpen: false,
      toastMessage: "",
    };
  }

  /** Updates the state to match the value in a textbox */
  updateField<K extends keyof UserSettingsState>(
    e: React.ChangeEvent<
      HTMLTextAreaElement | HTMLInputElement | HTMLSelectElement
    >,
    field: K
  ) {
    const value = e.target.value;

    this.setState({ [field]: value } as Pick<UserSettingsState, K>);
  }

  async isEmailOkay(): Promise<boolean> {
    const emailUnchanged =
      this.state.email.toLowerCase() === this.state.user.email.toLowerCase();

    if (emailUnchanged) {
      return true;
    }

    return !(await isEmailTaken(this.state.email));
  }

  //Update the alert message and display it for 3 seconds
  handleToastUpdate(message: string) {
    this.setState({
      toastMessage: message,
      toastOpen: true,
    });
    setTimeout(() => {
      this.setState({ toastMessage: "", toastOpen: false });
    }, 3000);
    return;
  }

  async onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (await this.isEmailOkay()) {
      await updateUser({
        ...this.state.user,
        name: this.state.name,
        phone: this.state.phone,
        email: this.state.email,
      });
      this.handleToastUpdate(this.props.t("userSettings.updateSuccess"));
    } else {
      this.setState({ emailTaken: true });
    }
  }

  handleToastDisplay(bool: boolean) {
    if (bool)
      return (
        <PositionedSnackbar
          open={this.state.toastOpen}
          message={this.state.toastMessage}
          vertical={"top"}
          horizontal={"center"}
        />
      );
  }

  render() {
    return (
      <React.Fragment>
        <Grid container justifyContent="center">
          <Card style={{ width: 450 }}>
            <form onSubmit={(e) => this.onSubmit(e)}>
              <CardContent>
                <Grid item container spacing={6}>
                  <Grid item container spacing={2} alignItems="center">
                    <Grid item>
                      <ClickableAvatar
                        avatar={this.state.avatar}
                        onClick={() =>
                          this.setState({ avatarDialogOpen: true })
                        }
                      />
                    </Grid>
                    <Grid item xs>
                      <TextField
                        id={`${idAffix}-name`}
                        fullWidth
                        variant="outlined"
                        value={this.state.name}
                        label={this.props.t("login.name")}
                        onChange={(e) => this.updateField(e, "name")}
                        inputProps={{ maxLength: 100 }}
                        style={{
                          margin: theme.spacing(1),
                          marginLeft: 0,
                        }}
                      />
                      <Typography variant="subtitle2" style={{ color: "grey" }}>
                        {this.props.t("login.username")}
                        {": "}
                        {this.state.user.username}
                      </Typography>
                    </Grid>
                  </Grid>

                  <Grid item container spacing={2}>
                    <Grid item>
                      <Typography variant="h6">Contact</Typography>
                    </Grid>

                    <Grid item container spacing={1} alignItems="center">
                      <Grid item>
                        <Phone />
                      </Grid>
                      <Grid item xs>
                        <TextField
                          id={`${idAffix}-phone`}
                          fullWidth
                          variant="outlined"
                          value={this.state.phone}
                          label="Phone"
                          onChange={(e) => this.updateField(e, "phone")}
                          type="tel"
                        />
                      </Grid>
                    </Grid>

                    <Grid item container spacing={1} alignItems="center">
                      <Grid item>
                        <Email />
                      </Grid>
                      <Grid item xs>
                        <TextField
                          id={`${idAffix}-email`}
                          required
                          fullWidth
                          variant="outlined"
                          value={this.state.email}
                          label={this.props.t("login.email")}
                          onChange={(e) => {
                            this.updateField(e, "email");
                            this.setState({ emailTaken: false });
                          }}
                          error={this.state.emailTaken}
                          helperText={
                            this.state.emailTaken
                              ? this.props.t("login.emailTaken")
                              : undefined
                          }
                          type="email"
                        />
                      </Grid>
                    </Grid>
                  </Grid>

                  <Grid item container justifyContent="flex-end">
                    <Button
                      type="submit"
                      variant="contained"
                      id={`${idAffix}-save`}
                    >
                      {this.props.t("buttons.save")}
                    </Button>
                  </Grid>
                </Grid>
              </CardContent>
            </form>
          </Card>
        </Grid>

        <AvatarDialog
          open={this.state.avatarDialogOpen}
          onClose={() => {
            this.setState({ avatar: getAvatar(), avatarDialogOpen: false });
          }}
        />
        {this.handleToastDisplay(this.state.toastOpen)}
      </React.Fragment>
    );
  }
}

export default withTranslation()(UserSettings);
