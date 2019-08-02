import React, { ReactNode } from "react";
import {
  Translate,
  LocalizeContextProps,
  withLocalize
} from "react-localize-redux";
import { People, Cancel } from "@material-ui/icons";
import { Button, Dialog } from "@material-ui/core";

import settingsComponent from "../SettingsComponent";
import { User } from "../../../types/user";
import avatar from "../../../resources/TestAvatar.jpg";
import userSelector from "./UserSelectorComponent";

export interface UserWithRole extends User {
  role: string;
}

enum UserAddProcess {
  Standby,
  SelectUser,
  SelectRole
}

export interface UserProps {
  users: UserWithRole[];
  allUsers: User[];
}

interface UserState {
  addingUser: UserAddProcess;
  userToAdd?: User | undefined;
}

class UserSettingsComponent extends React.Component<
  UserProps & LocalizeContextProps,
  UserState
> {
  constructor(props: UserProps & LocalizeContextProps) {
    super(props);

    this.selectUser = this.selectUser.bind(this);
    this.state = {
      addingUser: UserAddProcess.Standby
    };
  }

  private selectUser(userToAdd: User) {
    this.setState({ userToAdd, addingUser: UserAddProcess.SelectRole });
  }

  private exitButton(): ReactNode {
    return (
      <Button
        onClick={() =>
          this.setState({
            addingUser: UserAddProcess.Standby,
            userToAdd: undefined
          })
        }
      >
        <Cancel />
      </Button>
    );
  }

  private selectUserDialog(): ReactNode {
    return (
      <Dialog open={this.state.addingUser === UserAddProcess.SelectUser}>
        {userSelector(this.props.allUsers, this.selectUser, this.exitButton())}
      </Dialog>
    );
  }

  private selectRoleDialog(): ReactNode {
    return (
      <Dialog open={this.state.addingUser === UserAddProcess.SelectRole} />
    );
  }

  render() {
    return settingsComponent({
      header: "settings.user.header",
      icon: <People />,
      body: userSelector(
        this.props.allUsers,
        () => {},
        <Button
          color="default"
          variant="contained"
          style={{ width: "100%", height: "100%" }}
        >
          <Translate id="settings.user.addUser" />
          {this.selectUserDialog()}
          {this.selectRoleDialog()}
        </Button>
      )
    });
  }
}

export default withLocalize(UserSettingsComponent);
