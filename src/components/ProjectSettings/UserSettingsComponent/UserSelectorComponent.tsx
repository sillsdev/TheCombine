import React, { ReactNode } from "react";
import { GridList, GridListTile, GridListTileBar } from "@material-ui/core";

import avatar from "../../../resources/TestAvatar.jpg";
import { User } from "../../../types/user";

export default function userSelector(
  users: User[],
  select?: (user: User) => void,
  postfix?: ReactNode
) {
  return (
    <GridList cols={3}>
      {users.map(user => (
        <GridListTile onClick={select ? () => select(user) : undefined}>
          {/* Replace w/ icon */}
          <img src={avatar} />
          <GridListTileBar title={user.name} />
        </GridListTile>
      ))}
      {postfix && <GridListTile>{postfix}</GridListTile>}
    </GridList>
  );
}
