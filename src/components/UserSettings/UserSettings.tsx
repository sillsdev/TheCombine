import React from "react";
import {
  LocalizeContextProps,
  Translate,
  withLocalize,
} from "react-localize-redux";
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

import { User } from "api/models";
import { isEmailTaken, updateUser } from "backend";
import { getAvatar, getCurrentUser } from "backend/localStorage";
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
}

/**
 * A page to edit a user's details
 */
class UserSettings extends React.Component<
  LocalizeContextProps,
  UserSettingsState
> {
  constructor(props: LocalizeContextProps) {
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

  async onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (await this.isEmailOkay()) {
      await updateUser({
        ...this.state.user,
        name: this.state.name,
        phone: this.state.phone,
        email: this.state.email,
      });
      alert(this.props.translate("userSettings.updateSuccess"));
    } else {
      this.setState({ emailTaken: true });
    }
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
                        label={<Translate id="login.name" />}
                        onChange={(e) => this.updateField(e, "name")}
                        inputProps={{ maxLength: 100 }}
                        style={{
                          margin: theme.spacing(1),
                          marginLeft: 0,
                        }}
                      />
                      <Typography variant="subtitle2" style={{ color: "grey" }}>
                        <Translate id="login.username" />
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
                          label={<Translate id="login.email" />}
                          onChange={(e) => {
                            this.updateField(e, "email");
                            this.setState({ emailTaken: false });
                          }}
                          error={this.state.emailTaken}
                          helperText={
                            this.state.emailTaken
                              ? this.props.translate("login.emailTaken")
                              : null
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
                      <Translate id="buttons.save" />
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
      </React.Fragment>
    );
  }
}

export default withLocalize(UserSettings);
