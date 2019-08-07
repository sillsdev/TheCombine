import React, { ReactNode } from "react";
import { GridList, GridListTile, GridListTileBar } from "@material-ui/core";

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
          <img
            src={
              "https://www.sil.org/sites/default/files/expertise/ld_language_assessment_domain_0.jpg" // temp
            }
          />
          <GridListTileBar title={user.name} />
        </GridListTile>
      ))}
      {postfix && <GridListTile>{postfix}</GridListTile>}
    </GridList>
  );
}
