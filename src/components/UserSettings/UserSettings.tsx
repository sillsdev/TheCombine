import { CameraAlt, Email, Person, Phone } from "@mui/icons-material";
import {
  Avatar,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogContent,
  DialogTitle,
  Grid,
  TextField,
  Typography,
} from "@mui/material";
import { makeStyles } from "@mui/styles";
import { validate } from "email-validator";
import { useSnackbar } from "notistack";
import React, { ReactElement, useState } from "react";
import { useTranslation } from "react-i18next";

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
      "&:hover": { opacity: 0.9 },
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

export default function UserSettings(): ReactElement {
  const { t } = useTranslation();
  const potentialUser = getCurrentUser();
  const userCurr = potentialUser ?? newUser();
  const [user] = useState<User>(userCurr);
  const [name, setName] = useState(userCurr.name);
  const [phone, setPhone] = useState(userCurr.phone);
  const [email, setEmail] = useState(userCurr.email);
  const [emailInvalid, setEmailInvalid] = useState(false);
  const [emailTaken, setEmailTaken] = useState(false);
  const [avatar, setAvatar] = useState(getAvatar());
  const [avatarDialogOpen, setAvatarDialogOpen] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

  async function isEmailOkay(): Promise<boolean> {
    if (emailInvalid) {
      return false;
    }
    const emailUnchanged = email.toLowerCase() === user.email.toLowerCase();
    if (emailUnchanged) {
      return true;
    }
    if (await isEmailTaken(email)) {
      setEmailTaken(true);
      return false;
    }
    return true;
  }

  function onEmailChange(email: string): void {
    setEmail(email);
    setEmailInvalid(!validate(email));
    setEmailTaken(false);
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (await isEmailOkay()) {
      await updateUser({
        ...user,
        name: name,
        phone: phone,
        email: email,
      });
      enqueueSnackbar(t("userSettings.updateSuccess"));
    }
  }

  return (
    <>
      <Grid container justifyContent="center">
        <Card style={{ width: 450 }}>
          <form onSubmit={(e) => onSubmit(e)}>
            <CardContent>
              <Grid item container spacing={6}>
                <Grid item container spacing={2} alignItems="center">
                  <Grid item>
                    <ClickableAvatar
                      avatar={avatar}
                      onClick={() => setAvatarDialogOpen(true)}
                    />
                  </Grid>
                  <Grid item xs>
                    <TextField
                      id={`${idAffix}-name`}
                      fullWidth
                      variant="outlined"
                      value={name}
                      label={t("login.name")}
                      onChange={(e) => setName(e.target.value)}
                      inputProps={{ maxLength: 100 }}
                      style={{ margin: theme.spacing(1), marginLeft: 0 }}
                    />
                    <Typography variant="subtitle2" style={{ color: "grey" }}>
                      {t("login.username")}
                      {": "}
                      {user.username}
                    </Typography>
                  </Grid>
                </Grid>

                <Grid item container spacing={2}>
                  <Grid item>
                    <Typography variant="h6">
                      {t("userSettings.contact")}
                    </Typography>
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
                        value={phone}
                        label={t("userSettings.phone")}
                        onChange={(e) => setPhone(e.target.value)}
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
                        value={email}
                        label={t("login.email")}
                        onChange={(e) => onEmailChange(e.target.value)}
                        error={emailInvalid || emailTaken}
                        helperText={
                          emailInvalid
                            ? t("login.emailInvalid")
                            : emailTaken
                            ? t("login.emailTaken")
                            : undefined
                        }
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
                    {t("buttons.save")}
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </form>
        </Card>
      </Grid>

      <AvatarDialog
        open={avatarDialogOpen}
        onClose={() => {
          setAvatar(getAvatar());
          setAvatarDialogOpen(false);
        }}
      />
    </>
  );
}
