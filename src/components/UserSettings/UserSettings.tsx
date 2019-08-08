import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Link,
  Typography,
  Grid,
  Avatar,
  Container,
  TextField,
  Button,
  Card,
  CardContent,
  makeStyles
} from "@material-ui/core";
import { User } from "../../types/user";
import AvatarUpload from "./AvatarUpload";
import AppBarComponent from "../AppBar/AppBarComponent";
import {
  getAllProjectsByUser,
  avatarSrc,
  getUser,
  updateUser
} from "../../backend";
import { Phone, Email, Photo, Camera, CameraAlt } from "@material-ui/icons";
import theme from "../../types/theme";
import {
  LocalizeContextProps,
  withLocalize,
  Translate
} from "react-localize-redux";
import { render } from "react-dom";

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

function ClickableAvatar(props: { avatar?: string; onClick: () => void }) {
  const classes = makeStyles({
    avatar: {
      width: 60,
      height: 60
    },
    avatarOverlay: {
      transition: "opacity 0.2s",
      "&:hover": {
        opacity: 0.9
      },
      position: "absolute",
      width: 60,
      height: 60,
      top: 0,
      opacity: 0,
      cursor: "pointer"
    }
  })();

  return (
    <div style={{ position: "relative" }}>
      <Avatar className={classes.avatar} alt="Your avatar" src={props.avatar} />
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
  avatarDialogOpen: boolean;
  avatar?: string;
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
    const user = getCurrentUser();
    this.state = {
      user,
      name: user.name,
      phone: user.phone,
      email: user.email,
      avatarDialogOpen: false
    };
    this.getAvatar();
  }

  async getAvatar() {
    const user = getCurrentUser();
    const a = await avatarSrc(user);
    this.setState({ avatar: a });
  }

  /** Updates the state to match the value in a textbox */
  updateField<K extends keyof UserSettingsState>(
    e: React.ChangeEvent<
      HTMLTextAreaElement | HTMLInputElement | HTMLSelectElement
    >,
    field: K
  ) {
    const value = e.target.value;

    this.setState({
      [field]: value
    } as Pick<UserSettingsState, K>);
  }

  onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    let newUser = this.state.user;
    newUser.name = this.state.name;
    newUser.email = this.state.email;
    newUser.phone = this.state.phone;
    updateUser(newUser);
  }

  render() {
    return (
      <React.Fragment>
        <AppBarComponent />
        <Grid container justify="center">
          <Card style={{ width: 450 }}>
            <form onSubmit={e => this.onSubmit(e)}>
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
                        onChange={e => this.updateField(e, "name")}
                        inputProps={{ maxLength: 100 }}
                        style={{
                          margin: (theme.spacing(1) + "px ").repeat(3) + " 0" // "8px 8px 8px 0"
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
                          onChange={e => this.updateField(e, "phone")}
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
                          onChange={e => this.updateField(e, "email")}
                          type="email"
                        />
                      </Grid>
                    </Grid>
                  </Grid>

                  <Grid item container justify="flex-end">
                    <Button type="submit" variant="contained">
                      Save
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
            this.setState({ avatarDialogOpen: false });
            this.getAvatar();
          }}
        />
      </React.Fragment>
    );
  }
}

export default withLocalize(UserSettings);

export function getCurrentUser(): User {
  const userString = localStorage.getItem("user");
  return userString ? JSON.parse(userString) : null;
}

export async function updateCurrentUser() {
  const userString = localStorage.getItem("user");
  const user: User = userString ? JSON.parse(userString) : null;
  if (user) {
    const updatedUser = await getUser(user.id);
    localStorage.setItem("user", JSON.stringify(updatedUser));
  }
}
