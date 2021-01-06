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

import { isEmailTaken, updateUser } from "../../backend";
import {
  getAvatar,
  getCurrentUser,
  setCurrentUser,
} from "../../backend/localStorage";
import theme from "../../types/theme";
import { User } from "../../types/user";
import AvatarUpload from "./AvatarUpload";

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
    const potentialUser: User | null = getCurrentUser();
    const user: User = potentialUser ? potentialUser : new User("", "", "");
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

  isEmailOkay() {
    const emailUnchanged =
      this.state.email.toLowerCase() === this.state.user.email.toLowerCase();
    return emailUnchanged || !isEmailTaken(this.state.email);
  }

  onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (this.isEmailOkay()) {
      const newUser: User = this.state.user;
      newUser.name = this.state.name;
      newUser.phone = this.state.phone;
      newUser.email = this.state.email;
      updateUser(newUser).then((user: User) => {
        setCurrentUser(user);
        alert(this.props.translate("userSettings.updateSuccess"));
      });
    } else {
      this.setState({ emailTaken: true });
    }
  }

  render() {
    return (
      <React.Fragment>
        <Grid container justify="center">
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
                        fullWidth
                        variant="outlined"
                        value={this.state.name}
                        label={<Translate id="login.name" />}
                        onChange={(e) => this.updateField(e, "name")}
                        inputProps={{ maxLength: 100 }}
                        style={{
                          margin: (theme.spacing(1) + "px ").repeat(3) + " 0", // "8px 8px 8px 0"
                        }}
                      />
                      <Typography variant="subtitle2" style={{ color: "grey" }}>
                        <Translate id="login.username" />:{" "}
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

                  <Grid item container justify="flex-end">
                    <Button type="submit" variant="contained">
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
