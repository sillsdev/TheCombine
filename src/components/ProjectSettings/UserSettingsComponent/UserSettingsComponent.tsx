import React, { ReactNode } from "react";
import {
  Translate,
  LocalizeContextProps,
  withLocalize
} from "react-localize-redux";
import { People, Cancel } from "@material-ui/icons";
import {
  Button,
  Dialog,
  DialogTitle,
  Typography,
  IconButton,
  DialogContent,
  FormControl,
  FormLabel,
  FormGroup,
  FormControlLabel,
  Checkbox,
  RadioGroup,
  Radio,
  DialogActions
} from "@material-ui/core";

import * as backend from "../../../backend";
import settingsComponent from "../SettingsComponent";
import { User } from "../../../types/user";
import userSelector from "./UserSelectorComponent";
import theme from "../../../types/theme";
import { UserRole } from "../../../types/userRole";

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
  otherUsers: UserWithRole[];
  getUsers: () => Promise<void>;
  addUserToProject: (userRole: UserRole, role: string) => Promise<void>;
  removeUserFromProject: (removeUser: UserWithRole) => void;
  resetUsers: () => void;
}

interface UserState {
  addingUser?: UserAddProcess;
  userToAdd?: User | undefined;
  rolesToAdd?: Permission | undefined;
}

interface Permission {
  name: string;
  permissions: number[];
}

const PERMISSIONS: Permission[] = [
  {
    name: "settings.user.roles.admin",
    permissions: [1, 2, 3, 4, 5]
  },
  {
    name: "settings.user.roles.cleaner",
    permissions: [3]
  },
  {
    name: "settings.user.roles.typist",
    permissions: [1]
  }
];

class UserSettingsComponent extends React.Component<
  UserProps & LocalizeContextProps,
  UserState
> {
  constructor(props: UserProps & LocalizeContextProps) {
    super(props);

    this.selectUser = this.selectUser.bind(this);
    this.close = this.close.bind(this);
    this.state = {
      addingUser: UserAddProcess.Standby
    };
  }

  componentWillMount() {
    this.props.getUsers();
  }

  componentWillUnmount() {
    this.props.resetUsers();
  }

  private selectUser(userToAdd: User) {
    this.setState({ userToAdd, addingUser: UserAddProcess.SelectRole });
  }

  private close() {
    this.setState({
      userToAdd: undefined,
      addingUser: UserAddProcess.Standby
    });
  }

  private getRoleName(roles: number[]) {
    for (let permission of PERMISSIONS) {
      if (permission.permissions === roles) return permission.name;
    }
    return "settings.user.roles.unknown";
  }

  private exitButton(): ReactNode {
    return (
      <IconButton
        aria-label="close"
        style={{
          position: "absolute",
          right: theme.spacing(1),
          top: theme.spacing(1)
        }}
        onClick={this.close}
      >
        <Cancel />
      </IconButton>
    );
  }

  private header(id: string): ReactNode {
    return (
      <DialogTitle disableTypography>
        <Typography variant="h6">
          <Translate id={id} />
        </Typography>
        {this.exitButton()}
      </DialogTitle>
    );
  }

  private selectUserDialog(): ReactNode {
    return (
      <Dialog
        open={this.state.addingUser === UserAddProcess.SelectUser}
        onClose={this.close}
      >
        {this.header("settings.user.selectUser")}
        <DialogContent>
          {userSelector(this.props.otherUsers, this.selectUser)}
        </DialogContent>
      </Dialog>
    );
  }

  private selectRoleDialog(): ReactNode {
    return (
      <Dialog open={this.state.addingUser === UserAddProcess.SelectRole}>
        {this.header("settings.user.selectRole")}
        <DialogContent>
          <FormControl>
            {/* Interface */}
            <RadioGroup
              value={this.state.rolesToAdd && this.state.rolesToAdd.name}
            >
              {PERMISSIONS.map(value => (
                <FormControlLabel
                  value={value.name}
                  label={<Translate id={value.name} />}
                  control={
                    <Radio
                      onClick={() => this.setState({ rolesToAdd: value })}
                    />
                  }
                />
              ))}
            </RadioGroup>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button
            variant="contained"
            color="primary"
            component="span"
            disabled={!this.state.rolesToAdd}
            onClick={() => {
              if (this.state.userToAdd && this.state.rolesToAdd) {
                this.props.addUserToProject(
                  {
                    id: this.state.userToAdd.id,
                    projectId: "ignored",
                    permissions: this.state.rolesToAdd.permissions
                  },
                  this.getRoleName(this.state.rolesToAdd.permissions)
                );
                this.close();
              }
            }}
          >
            <Translate id="settings.user.confirmUser" />
          </Button>
        </DialogActions>
      </Dialog>
    );
  }

  render() {
    return settingsComponent({
      header: "settings.user.header",
      icon: <People />,
      body: userSelector(
        this.props.users,
        () => {},
        <React.Fragment>
          <Button
            color="default"
            variant="contained"
            style={{ width: "100%", height: "100%" }}
            onClick={() =>
              this.setState({ addingUser: UserAddProcess.SelectUser })
            }
          >
            <Translate id="settings.user.addUser" />
          </Button>
          {this.selectUserDialog()}
          {this.selectRoleDialog()}
        </React.Fragment>
      )
    });
  }
}

export default withLocalize(UserSettingsComponent);
