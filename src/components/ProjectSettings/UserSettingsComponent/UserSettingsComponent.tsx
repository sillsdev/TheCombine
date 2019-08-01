import React, { ReactNode } from "react";
import {
  Translate,
  LocalizeContextProps,
  withLocalize
} from "react-localize-redux";
import { People } from "@material-ui/icons";
import {
  GridList,
  GridListTile,
  Typography,
  Tooltip,
  GridListTileBar
} from "@material-ui/core";

import settingsComponent from "../SettingsComponent";
import { User } from "../../../types/user";
import parent from "../../../resources/tree/parent.svg";

export interface UserWithRole extends User {
  role: string;
}

export interface UserProps {
  users: UserWithRole[];
}

class UserSettingsComponent extends React.Component<
  UserProps & LocalizeContextProps
> {
  render() {
    return settingsComponent({
      header: "settings.user.header",
      icon: <People />,
      body: (
        <GridList>
          {this.props.users.map(user => (
            <GridListTile>
              {/* Replace w/ icon */}
              <img src={parent} />
              <GridListTileBar title={user.name} subtitle={user.role} />
            </GridListTile>
          ))}
        </GridList>
      )
    });
  }
}

export default withLocalize(UserSettingsComponent);
