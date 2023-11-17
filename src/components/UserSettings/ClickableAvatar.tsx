import { CameraAlt, Person } from "@mui/icons-material";
import { Avatar, Dialog, DialogContent, DialogTitle } from "@mui/material";
import { ReactElement, useState } from "react";

import { getAvatar } from "backend/localStorage";
import AvatarUpload from "components/UserSettings/AvatarUpload";

const avatarStyle = { height: 60, width: 60 };
const avatarOverlayStyle = {
  ...avatarStyle,
  transition: "opacity 0.2s",
  "&:hover": { opacity: 0.9 },
  position: "absolute",
  top: 0,
  opacity: 0,
  cursor: "pointer",
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

  const closeDialog = (): void => {
    props.setAvatar(getAvatar());
    setAvatarDialogOpen(false);
  };

  return (
    <>
      <div style={{ position: "relative" }}>
        {props.avatar ? (
          <Avatar alt="User avatar" src={props.avatar} sx={avatarStyle} />
        ) : (
          <Person style={{ fontSize: 60 }} />
        )}
        <Avatar
          onClick={() => setAvatarDialogOpen(true)}
          sx={avatarOverlayStyle}
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
