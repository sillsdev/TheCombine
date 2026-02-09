import { Avatar } from "@mui/material";
import { ReactElement, useEffect, useState } from "react";

import { UserStub } from "api/models";
import { avatarSrc } from "backend";

interface UserAvatarProps {
  /** Specify `alt` for an avatar serving as content;
   * defaults to empty string for a decorative avatar. */
  alt?: string;
  /** The user whose avatar to display (if `user.hasAvatar` is `true`). */
  user: UserStub;
}

/** MUI Avatar component for a given user. */
export default function UserAvatar(props: UserAvatarProps): ReactElement {
  const [src, setSrc] = useState<string | undefined>();

  useEffect(() => {
    setSrc(undefined);
    if (props.user.hasAvatar) {
      avatarSrc(props.user.id).then(setSrc);
    }
  }, [props.user.hasAvatar, props.user.id]);

  return <Avatar alt={props.alt ?? ""} src={src} />;
}
