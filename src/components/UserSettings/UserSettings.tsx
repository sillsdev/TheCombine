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
  TextField
} from "@material-ui/core";
import { User } from "../../types/user";
import AvatarUpload from "./AvatarUpload";
import AppBarComponent from "../AppBar/AppBarComponent";
import { getAllProjectsByUser } from "../../backend";
import { Phone, Email } from "@material-ui/icons";
import theme from "../../types/theme";

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

/**
 * A page to edit a user's details
 */
export default function UserSettings() {
  let [avatarDialogOpen, setAvatarDialogOpen] = React.useState<boolean>(false);
  const user = getCurrentUser();
  let projectNames: string[] = [];

  function getProjects() {
    getAllProjectsByUser(user).then(
      projects => (projectNames = projects.map(p => p.name))
    );
  }

  getProjects();

  return (
    <React.Fragment>
      <AppBarComponent />
      <Grid container spacing={6}>
        <Grid item container spacing={2}>
          <Grid item>
            <Grid container direction="column" alignItems="center">
              <Grid item>
                <Avatar
                  alt="Your avatar"
                  src="https://material-ui.com/static/images/avatar/1.jpg"
                  style={{
                    width: 60,
                    height: 60
                  }}
                />
              </Grid>
              <Grid item>
                <Typography>
                  <Link
                    variant="subtitle2"
                    href="#"
                    onClick={() => setAvatarDialogOpen(true)}
                  >
                    Change
                  </Link>
                </Typography>
              </Grid>
            </Grid>
          </Grid>
          <Grid item>
            <TextField value={user.name} label="Name" />
            <Typography
              variant="subtitle2"
              style={{ color: "grey", marginTop: theme.spacing(1) }}
            >
              Username: {user.username}
            </Typography>
          </Grid>
        </Grid>
        <Grid item xs={12} container direction="column" spacing={2}>
          <Typography variant="h6">Contact</Typography>
          <Grid item container spacing={1} alignItems="flex-end">
            <Grid item>
              <Phone />
            </Grid>
            <Grid item>
              <TextField value={user.phone} label="Phone" />
            </Grid>
          </Grid>
          <Grid item container spacing={1} alignItems="flex-end">
            <Grid item>
              <Email />
            </Grid>
            <Grid item>
              <TextField value={user.email} label="Email" />
            </Grid>
          </Grid>
        </Grid>
      </Grid>

      <AvatarDialog
        open={avatarDialogOpen}
        onClose={() => setAvatarDialogOpen(false)}
      />
    </React.Fragment>
  );
}

export function getCurrentUser(): User {
  const userString = localStorage.getItem("user");
  return userString ? JSON.parse(userString) : null;
}
