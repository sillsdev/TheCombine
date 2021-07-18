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
  Select,
  Tooltip,
} from "@material-ui/core";
import CancelConfirmDialog from "components/Buttons/CancelConfirmDialog";
import MoreVertIcon from "@material-ui/icons/MoreVert";

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

const projectSettingsTranslation = "projectSettings.userManagement.";

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

  private removeUser(userId: string) {
    removeUserRole([Permission.DeleteEditSettingsAndUsers], userId)
      .then(() => this.handleRemoveUserDialogClose())
      .then(() => {
        toast(
          <Translate
            id={`${projectSettingsTranslation}userRemovedToastSuccess`}
          />
        );
      })
      .catch((err: string) => {
        console.error(err);
        toast(
          <Translate
            id={`${projectSettingsTranslation}userRemovedToastFailure`}
          />
        );
      });
  }

  private makeAdmin(userId: string) {
    addOrUpdateUserRole(
      [
        Permission.WordEntry,
        Permission.Unused,
        Permission.MergeAndCharSet,
        Permission.ImportExport,
        Permission.DeleteEditSettingsAndUsers,
      ],
      userId
    )
      .then(() => this.handleMakeAdminDialogClose())
      .then(() => {
        toast(
          <Translate
            id={`${projectSettingsTranslation}makeAdminToastSuccess`}
          />
        );
      })
      .catch((err: string) => {
        console.error(err);
        toast(
          <Translate
            id={`${projectSettingsTranslation}makeAdminToastFailure`}
          />
        );
      });
  }

  private removeAdmin(userId: string) {
    addOrUpdateUserRole(
      [Permission.MergeAndCharSet, Permission.Unused, Permission.WordEntry],
      userId
    )
      .then(() => this.handleRemoveAdminDialogClose())
      .then(() => {
        toast(
          <Translate
            id={`${projectSettingsTranslation}removeAdminToastSuccess`}
          />
        );
      })
      .catch((err: string) => {
        console.error(err);
        toast(
          <Translate
            id={`${projectSettingsTranslation}removeAdminToastFailure`}
          />
        );
      });
  }

  private async populateUsers() {
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
    this.setState({ anchorEl: undefined, removeUserDialogOpen: true });
  }

  private handleRemoveUserDialogClose() {
    this.setState({ removeUserDialogOpen: false });
  }

  private handleMakeAdminDialogOpen() {
    this.setState({ anchorEl: undefined, makeAdminDialogOpen: true });
  }

  private handleMakeAdminDialogClose() {
    this.setState({ makeAdminDialogOpen: false });
  }

  private handleRemoveAdminDialogOpen() {
    this.setState({ anchorEl: undefined, removeAdminDialogOpen: true });
  }

  private handleRemoveAdminDialogClose() {
    this.setState({ removeAdminDialogOpen: false });
  }

  private menuItemRemoveAdmin = () => (
    <MenuItem onClick={() => this.handleRemoveAdminDialogOpen()}>
      <Translate id="buttons.removeAdmin" />
    </MenuItem>
  );
  private menuItemMakeAdmin = () => (
    <MenuItem onClick={() => this.handleMakeAdminDialogOpen()}>
      <Translate id="buttons.makeAdmin" />
    </MenuItem>
  );

  render() {
    const userList: React.ReactElement<ListItemProps>[] = [];
    const currentUser = localStorage.getItem("user");
    const currentProjectId = localStorage.getItem("projectId");
    const sortedUserList = this.getSortedUsers();

    sortedUserList.forEach((user) => {
      let manageUser: React.ReactElement<ElementType>;
      if (
        currentUser &&
        JSON.parse(currentUser).isAdmin &&
        currentProjectId &&
        user.id !== JSON.parse(currentUser).id &&
        !user.isAdmin
      ) {
        const adminOption = this.isProjectAdmin(
          user.projectRoles[currentProjectId]
        )
          ? this.menuItemRemoveAdmin()
          : this.menuItemMakeAdmin();
        manageUser = (
          <div>
            <CancelConfirmDialog
              open={this.state.removeUserDialogOpen}
              textId={`${projectSettingsTranslation}removeUserWarning`}
              handleCancel={() => this.handleRemoveUserDialogClose()}
              handleAccept={() => this.removeUser(user.id)}
            />
            <CancelConfirmDialog
              open={this.state.makeAdminDialogOpen}
              textId={`${projectSettingsTranslation}makeAdminWarning`}
              handleCancel={() => this.handleMakeAdminDialogClose()}
              handleAccept={() => this.makeAdmin(user.id)}
            />
            <CancelConfirmDialog
              open={this.state.removeAdminDialogOpen}
              textId={`${projectSettingsTranslation}removeAdminWarning`}
              handleCancel={() => this.handleRemoveAdminDialogClose()}
              handleAccept={() => this.removeAdmin(user.id)}
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
              onClose={() => this.setState({ anchorEl: undefined })}
            >
              <MenuItem onClick={() => this.handleRemoveUserDialogOpen()}>
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
    });

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
