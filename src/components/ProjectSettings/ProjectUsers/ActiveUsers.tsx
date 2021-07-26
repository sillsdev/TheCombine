import {
  Avatar,
  FormControl,
  IconButton,
  InputLabel,
  List,
  ListItem,
  ListItemProps,
  ListItemText,
  MenuItem,
  Select,
  Tooltip,
} from "@material-ui/core";
import MoreVertIcon from "@material-ui/icons/MoreVert";
import SortByAlphaIcon from "@material-ui/icons/SortByAlpha";
import React, { ElementType } from "react";
import { Translate } from "react-localize-redux";

import { Permission, Project, User, UserRole } from "api/models";
import { avatarSrc, getAllUsersInCurrentProject, getUserRoles } from "backend";
import { getCurrentUser, getProjectId } from "backend/localStorage";
import CancelConfirmDialogCollection from "components/ProjectSettings/ProjectUsers/CancelConfirmDialogCollection";
import theme from "types/theme";

enum UserOrder {
  Username,
  Name,
  Email,
}

interface UserProps {
  project: Project;
}

interface UserState {
  projUsers: User[];
  projUserRoles: UserRole[];
  userAvatar: { [key: string]: string };
  userOrder: UserOrder;
  reverseSorting: boolean;
}

export default class ActiveUsers extends React.Component<UserProps, UserState> {
  constructor(props: UserProps) {
    super(props);
    this.state = {
      projUsers: [],
      projUserRoles: [],
      userAvatar: {},
      userOrder: UserOrder.Username,
      reverseSorting: false,
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

  private populateUsers() {
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
          return this.state.reverseSorting
            ? b.name.localeCompare(a.name)
            : a.name.localeCompare(b.name);
        case UserOrder.Username:
          return this.state.reverseSorting
            ? b.username.localeCompare(a.username)
            : a.username.localeCompare(b.username);
        case UserOrder.Email:
          return this.state.reverseSorting
            ? b.email.localeCompare(a.email)
            : a.email.localeCompare(b.email);
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
      return userRole.permissions.includes(
        Permission.DeleteEditSettingsAndUsers
      );
    }
    return false;
  }

  private isProjectOwner(userRoleId: string): boolean {
    const userRole = this.state.projUserRoles.find(
      (role) => role.id === userRoleId
    );
    if (userRole) {
      return userRole.permissions.includes(Permission.Owner);
    }
    return false;
  }

  render() {
    const userList: React.ReactElement<ListItemProps>[] = [];
    const currentUser = getCurrentUser();
    const currentProjectId = getProjectId();
    const sortedUserList = this.getSortedUsers();
    if (!currentUser || !currentProjectId) {
      return <div />;
    }
    const currentUserIsProjectAdmin = this.isProjectAdmin(
      currentUser.projectRoles[currentProjectId]
    );
    const currentUserIsProjectOwner = this.isProjectOwner(
      currentUser.projectRoles[currentProjectId]
    );

    sortedUserList.forEach((user) => {
      let manageUser: React.ReactElement<ElementType>;
      const userIsProjectAdmin = this.isProjectAdmin(
        user.projectRoles[currentProjectId]
      );
      const userIsProjectOwner = this.isProjectOwner(
        user.projectRoles[currentProjectId]
      );
      if (
        currentUserIsProjectAdmin &&
        user.id !== currentUser.id &&
        !userIsProjectOwner &&
        (!userIsProjectAdmin || currentUserIsProjectOwner)
      ) {
        manageUser = (
          <CancelConfirmDialogCollection
            userId={user.id}
            isProjectOwner={currentUserIsProjectOwner}
            userIsProjectAdmin={userIsProjectAdmin}
          />
        );
      } else {
        manageUser = (
          <IconButton disabled>
            <MoreVertIcon />
          </IconButton>
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

    const sortOptions = [
      <MenuItem value={UserOrder.Name}>
        <Translate id="projectSettings.language.name" />
      </MenuItem>,
      <MenuItem value={UserOrder.Username}>
        <Translate id="login.username" />
      </MenuItem>,
    ];
    if (currentUserIsProjectOwner || currentUser.isAdmin) {
      sortOptions.push(
        <MenuItem value={UserOrder.Email}>
          <Translate id="login.email" />
        </MenuItem>
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
                reverseSorting: false,
              });
            }}
          >
            {sortOptions}
          </Select>
        </FormControl>
        <Tooltip
          title={<Translate id="projectSettings.userManagement.reverseOrder" />}
          placement="right"
        >
          <IconButton
            onClick={() =>
              this.setState({
                reverseSorting: !this.state.reverseSorting,
              })
            }
          >
            <SortByAlphaIcon />
          </IconButton>
        </Tooltip>
        <List>{userList}</List>
      </React.Fragment>
    );
  }
}
