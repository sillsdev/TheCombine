import {
  Avatar,
  FormControl,
  IconButton,
  InputLabel,
  List,
  ListItem,
  ListItemProps,
  ListItemText,
  Menu,
  MenuItem,
  MenuItemProps,
  Select,
  Tooltip,
} from "@material-ui/core";
import DeleteDialog from "components/Buttons/DeleteDialog";
import MakeAdminDialog from "components/Buttons/MakeAdminDialog";
import RemoveAdminDialog from "components/Buttons/RemoveAdminDialog";
import MoreVertIcon from "@material-ui/icons/MoreVert";
import DeleteForeverIcon from "@material-ui/icons/DeleteForever";

import { toast } from "react-toastify";
//styles the ToastContainer so that it appears on the upper right corner with the message.
import "react-toastify/dist/ReactToastify.min.css";
import { Translate } from "react-localize-redux";
import React, { ElementType } from "react";

import { Permission, Project, User, UserRole } from "api/models";
import {
  addOrUpdateUserRole,
  avatarSrc,
  getAllUsersInCurrentProject,
  getUserRoles,
  removeUserRole,
} from "backend";
import theme from "types/theme";

enum UserOrder {
  Username,
  Name,
}

interface UserProps {
  project: Project;
}

interface UserState {
  projUsers: User[];
  projUserRoles: UserRole[];
  userAvatar: { [key: string]: string };
  userOrder: UserOrder;
  removeUserDialogOpen: boolean;
  makeAdminDialogOpen: boolean;
  removeAdminDialogOpen: boolean;
  anchorEl: Element | undefined;
}

export default class ActiveUsers extends React.Component<UserProps, UserState> {
  constructor(props: UserProps) {
    super(props);
    this.state = {
      projUsers: [],
      projUserRoles: [],
      userAvatar: {},
      userOrder: UserOrder.Username,
      removeUserDialogOpen: false,
      makeAdminDialogOpen: false,
      removeAdminDialogOpen: false,
      anchorEl: undefined,
    };
  }

  componentDidMount() {
    this.populateUsers();
  }

  componentDidUpdate(prevProps: UserProps) {
    if (this.props.project.name !== prevProps.project.name) {
      this.populateUsers();
    }
  }

  // TODO: Add the correct text for toast
  private removeUser() {
    removeUserRole(
      [Permission.DeleteEditSettingsAndUsers],
      arguments[0] as string
    )
      .then(this.handleRemoveUserDialogClose.bind(this))
      .then(() => {
        this.setState({ anchorEl: undefined });
      })
      .then(() => {
        toast(<Translate id="projectSettings.invite.toastSuccess" />);
      })
      .catch((err: string) => {
        console.log(err);
        toast(<Translate id="projectSettings.invite.toastFail" />);
      });
  }

  // TODO: Add the correct text for toast
  private makeAdmin() {
    addOrUpdateUserRole(
      [
        Permission.WordEntry,
        Permission.Unused,
        Permission.MergeAndCharSet,
        Permission.ImportExport,
        Permission.DeleteEditSettingsAndUsers,
      ],
      arguments[0] as string
    )
      .then(this.handleMakeAdminDialogClose.bind(this))
      .then(() => {
        this.setState({ anchorEl: undefined });
      })
      .then(() => {
        toast(<Translate id="projectSettings.invite.toastSuccess" />);
      })
      .catch((err: string) => {
        console.log(err);
        toast(<Translate id="projectSettings.invite.toastFail" />);
      });
  }

  // TODO: Add the correct text for toast
  private removeAdmin() {
    addOrUpdateUserRole(
      [Permission.MergeAndCharSet, Permission.Unused, Permission.WordEntry],
      arguments[0] as string
    )
      .then(this.handleRemoveAdminDialogClose.bind(this))
      .then(() => {
        this.setState({ anchorEl: undefined });
      })
      .then(() => {
        toast(<Translate id="projectSettings.invite.toastSuccess" />);
      })
      .catch((err: string) => {
        console.log(err);
        toast(<Translate id="projectSettings.invite.toastFail" />);
      });
  }

  private async populateUsers() {
    console.log("populated users");
    getAllUsersInCurrentProject()
      .then(async (projUsers) => {
        this.setState({ projUsers });
        const userAvatar = this.state.userAvatar;
        const promises = projUsers.map(async (u) => {
          if (u.hasAvatar) {
            userAvatar[u.id] = await avatarSrc(u.id);
          }
        });
        await Promise.all(promises);
        this.setState({ userAvatar });
      })
      .catch((err) => console.error(err));
    getUserRoles()
      .then((projUserRoles) => this.setState({ projUserRoles }))
      .catch((err) => console.error(err));
  }

  private getSortedUsers() {
    const users = this.state.projUsers;

    // Need to make a copy of the "projUser" field in the state because sort()
    // mutates
    return users.slice(0).sort((a: User, b: User) => {
      switch (this.state.userOrder) {
        case UserOrder.Name:
          return a.name.localeCompare(b.name);
        case UserOrder.Username:
          return a.username.localeCompare(b.username);
        default:
          throw new Error();
      }
    });
  }

  private isProjectAdmin(userRoleId: string): boolean {
    console.log(this.state.projUserRoles);
    console.log(userRoleId);
    const userRole = this.state.projUserRoles.find(
      (role) => role.id === userRoleId
    );
    if (userRole) {
      return (
        userRole.permissions.includes(Permission.DeleteEditSettingsAndUsers) &&
        userRole.permissions.includes(Permission.ImportExport)
      );
    }
    return false;
  }

  private handleRemoveUserDialogOpen() {
    this.setState({ removeUserDialogOpen: true });
  }

  private handleRemoveUserDialogClose() {
    this.setState({ removeUserDialogOpen: false });
  }

  private handleMakeAdminDialogOpen() {
    this.setState({ makeAdminDialogOpen: true });
  }

  private handleMakeAdminDialogClose() {
    this.setState({ makeAdminDialogOpen: false });
  }

  private handleRemoveAdminDialogOpen() {
    this.setState({ removeAdminDialogOpen: true });
  }

  private handleRemoveAdminDialogClose() {
    this.setState({ removeAdminDialogOpen: false });
  }

  render() {
    var userList: React.ReactElement<ListItemProps>[] = [];
    var manageUser: React.ReactElement<ElementType>;
    var adminOption: React.ReactElement<MenuItemProps>;
    const currentUser = localStorage.getItem("user");
    const currentProjectId = localStorage.getItem("projectId");
    const sortedUserList = this.getSortedUsers();

    for (var i = 0; i < sortedUserList.length; i++) {
      var user = sortedUserList[i];
      if (
        currentUser &&
        JSON.parse(currentUser).isAdmin &&
        currentProjectId &&
        user.id !== JSON.parse(currentUser).id &&
        !user.isAdmin
      ) {
        var hi = this.isProjectAdmin(user.projectRoles[currentProjectId]);
        console.log(hi);
        if (hi) {
          adminOption = (
            <MenuItem onClick={this.handleRemoveAdminDialogOpen.bind(this)}>
              <Translate id="buttons.removeAdmin" />
            </MenuItem>
          );
        } else {
          adminOption = (
            <MenuItem onClick={this.handleMakeAdminDialogOpen.bind(this)}>
              <Translate id="buttons.makeAdmin" />
            </MenuItem>
          );
        }
        manageUser = (
          <div>
            <DeleteDialog
              open={this.state.removeUserDialogOpen}
              textId={"projectSettings.userManagement.removeUserWarning"}
              handleCancel={this.handleRemoveUserDialogClose.bind(this)}
              handleAccept={this.removeUser.bind(this, [user.id])}
            />
            <MakeAdminDialog
              open={this.state.makeAdminDialogOpen}
              textId={"projectSettings.userManagement.makeAdminWarning"}
              handleCancel={this.handleMakeAdminDialogClose.bind(this)}
              handleAccept={this.makeAdmin.bind(this, [user.id])}
            />
            <RemoveAdminDialog
              open={this.state.removeAdminDialogOpen}
              textId={"projectSettings.userManagement.removeAdminWarning"}
              handleCancel={this.handleRemoveAdminDialogClose.bind(this)}
              handleAccept={this.removeAdmin.bind(this, [user.id])}
            />
            <Tooltip title="Manage User" placement="right">
              <IconButton
                id="user-options"
                onClick={(event) => {
                  this.setState({
                    anchorEl: event.currentTarget,
                  });
                }}
              >
                <MoreVertIcon />
              </IconButton>
            </Tooltip>
            <Menu
              id="simple-menu"
              anchorEl={this.state.anchorEl}
              keepMounted
              open={Boolean(this.state.anchorEl)}
              onClose={() => {
                this.setState({
                  anchorEl: undefined,
                });
              }}
            >
              <MenuItem onClick={this.handleRemoveUserDialogOpen.bind(this)}>
                <Translate id="buttons.removeFromProject" />
              </MenuItem>
              {adminOption}
            </Menu>
          </div>
        );
      } else {
        manageUser = (
          <Tooltip title="You cannot edit this user">
            <IconButton disabled>
              <MoreVertIcon />
            </IconButton>
          </Tooltip>
        );
      }
      userList.push(
        <ListItem key={user.id}>
          <Avatar
            alt="User Avatar"
            src={this.state.userAvatar[user.id]}
            style={{ marginRight: theme.spacing(1) }}
          />
          <ListItemText primary={`${user.name} (${user.username})`} />
          {manageUser}
        </ListItem>
      );
    }

    return (
      <React.Fragment>
        <FormControl style={{ minWidth: 100 }}>
          <InputLabel id="sorting-order-select">
            <Translate id="charInventory.sortBy" />
          </InputLabel>
          <Select
            labelId="sorting-order-select"
            defaultValue={UserOrder.Username}
            onChange={(event: React.ChangeEvent<{ value: unknown }>) => {
              this.setState({
                userOrder: event.target.value as UserOrder,
              });
            }}
          >
            <MenuItem value={UserOrder.Name}>
              <Translate id="projectSettings.language.name" />
            </MenuItem>
            <MenuItem value={UserOrder.Username}>
              <Translate id="login.username" />
            </MenuItem>
          </Select>
        </FormControl>
        <List>{userList}</List>
      </React.Fragment>
    );
  }
}
