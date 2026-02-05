import { Avatar } from "@mui/material";
import { ReactElement, useEffect, useState } from "react";

import { UserStub } from "api/models";
import { avatarSrc } from "backend";

export default function UserAvatar(props: { user: UserStub }): ReactElement {
  const [src, setSrc] = useState<string | undefined>();

  useEffect(() => {
    if (props.user.hasAvatar) {
      avatarSrc(props.user.id).then(setSrc);
    }
  }, [props.user.hasAvatar, props.user.id]);

  return <Avatar src={src} />;
}
