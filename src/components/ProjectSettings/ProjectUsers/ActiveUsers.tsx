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
} from "@material-ui/core";
import MoreVertIcon from "@material-ui/icons/MoreVert";
import React, { ElementType, useEffect, useState } from "react";
import { Translate } from "react-localize-redux";
import { useSelector } from "react-redux";

import { Permission, User, UserRole } from "api/models";
import { avatarSrc, getUserRoles } from "backend";
import { getCurrentUser, getProjectId } from "backend/localStorage";
import CancelConfirmDialogCollection from "components/ProjectSettings/ProjectUsers/CancelConfirmDialogCollection";
import { StoreState } from "types";
import theme from "types/theme";

enum UserOrder {
  Username,
  Name,
}

export default function ActiveUsers() {
  const projectUsers = useSelector(
    (state: StoreState) => state.currentProjectState.users
  );
  const [projUserRoles, setProjUserRoles] = useState<UserRole[]>([]);
  const [userAvatar, setUserAvatar] = useState<{ [key: string]: string }>({});
  const [userOrder, setUserOrder] = useState<UserOrder>(UserOrder.Username);

  useEffect(() => {
    getUserRoles().then(setProjUserRoles);
    // eslint-disable-next-line
  }, [projectUsers, setProjUserRoles]);

  useEffect(() => {
    const tempUserAvatar = { ...userAvatar };
    const promises = projectUsers.map(async (u) => {
      if (u.hasAvatar) {
        tempUserAvatar[u.id] = await avatarSrc(u.id);
      }
    });
    Promise.all(promises).then(() => setUserAvatar(tempUserAvatar));
    // eslint-disable-next-line
  }, [projectUsers, setUserAvatar]);

  function getSortedUsers() {
    // Copy the "projectUser" array because sort() mutates.
    return [...projectUsers].sort((a: User, b: User) => {
      switch (userOrder) {
        case UserOrder.Name:
          return a.name.localeCompare(b.name);
        case UserOrder.Username:
          return a.username.localeCompare(b.username);
        default:
          throw new Error();
      }
    });
  }

  function isProjectAdmin(userRoleId: string): boolean {
    const userRole = projUserRoles.find((role) => role.id === userRoleId);
    if (userRole) {
      return userRole.permissions.includes(
        Permission.DeleteEditSettingsAndUsers
      );
    }
    return false;
  }

  function isProjectOwner(userRoleId: string): boolean {
    const userRole = projUserRoles.find((role) => role.id === userRoleId);
    if (userRole) {
      return userRole.permissions.includes(Permission.Owner);
    }
    return false;
  }

  const userList: React.ReactElement<ListItemProps>[] = [];
  const currentUser = getCurrentUser();
  const currentProjectId = getProjectId();
  const sortedUserList = getSortedUsers();
  if (!currentUser || !currentProjectId) {
    return <div />;
  }
  const currentUserIsProjectAdmin = isProjectAdmin(
    currentUser.projectRoles[currentProjectId]
  );
  const currentUserIsProjectOwner = isProjectOwner(
    currentUser.projectRoles[currentProjectId]
  );

  sortedUserList.forEach((user) => {
    let manageUser: React.ReactElement<ElementType>;
    const userIsProjectAdmin = isProjectAdmin(
      user.projectRoles[currentProjectId]
    );
    const userIsProjectOwner = isProjectOwner(
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
          src={userAvatar[user.id]}
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
            setUserOrder(event.target.value as UserOrder);
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
