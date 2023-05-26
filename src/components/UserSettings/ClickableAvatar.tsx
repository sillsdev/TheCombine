import { CameraAlt, Person } from "@mui/icons-material";
import { Avatar, Dialog, DialogContent, DialogTitle } from "@mui/material";
import { DefaultTheme, makeStyles, Styles } from "@mui/styles";
import { ReactElement, useState } from "react";

import { getAvatar } from "backend/localStorage";
import AvatarUpload from "components/UserSettings/AvatarUpload";

const clickableAvatarClassProps: Styles<DefaultTheme, {}> = {
  avatar: { width: 60, height: 60 },
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
};

interface ClickableAvatarProps {
  avatar?: string;
  setAvatar: (avatar: string) => void;
}

/** An avatar with a camera icon when hovered */
export default function ClickableAvatar(
  props: ClickableAvatarProps
): ReactElement {
  const [avatarDialogOpen, setAvatarDialogOpen] = useState(false);
  const classes = makeStyles(clickableAvatarClassProps)();

  const closeDialog = (): void => {
    props.setAvatar(getAvatar());
    setAvatarDialogOpen(false);
  };

  return (
    <>
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
        <Avatar
          className={classes.avatarOverlay}
          onClick={() => setAvatarDialogOpen(true)}
        >
          <CameraAlt />
        </Avatar>
      </div>

      <Dialog onClose={closeDialog} open={avatarDialogOpen}>
        <DialogTitle>Set user avatar</DialogTitle>
        <DialogContent>
          <AvatarUpload doneCallback={closeDialog} />
        </DialogContent>
      </Dialog>
    </>
  );
}
