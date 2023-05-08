import { MoreVert } from "@mui/icons-material";
import {
  Avatar,
  IconButton,
  List,
  ListItem,
  ListItemText,
  SelectChangeEvent,
} from "@mui/material";
import {
  Fragment,
  ReactElement,
  useCallback,
  useEffect,
  useState,
} from "react";
import { useSelector } from "react-redux";

import { Permission, User, UserRole } from "api/models";
import { avatarSrc, getUserRoles } from "backend";
import { getCurrentUser, getProjectId } from "backend/localStorage";
import CancelConfirmDialogCollection from "components/ProjectSettings/ProjectUsers/CancelConfirmDialogCollection";
import SortOptions, {
  UserOrder,
  getUserCompare,
} from "components/ProjectSettings/ProjectUsers/SortOptions";
import { StoreState } from "types";
import { Hash } from "types/hash";
import theme from "types/theme";

export default function ActiveUsers(): ReactElement {
  const projectUsers = useSelector(
    (state: StoreState) => state.currentProjectState.users
  );
  const [projUserRoles, setProjUserRoles] = useState<UserRole[]>([]);
  const [userAvatar, setUserAvatar] = useState<Hash<string>>({});
  const [userOrder, setUserOrder] = useState<UserOrder>(UserOrder.Username);
  const [reverseSorting, setReverseSorting] = useState<boolean>(false);
  const [sortedUsers, setSortedUsers] = useState<User[]>([]);

  const compareUsers = useCallback(
    (a: User, b: User): number =>
      getUserCompare(userOrder, reverseSorting)(a, b),
    [reverseSorting, userOrder]
  );

  useEffect(() => {
    getUserRoles().then(setProjUserRoles);
  }, [projectUsers, setProjUserRoles]);

  useEffect(() => {
    const newUserAvatar: Hash<string> = {};
    const promises = projectUsers.map(async (u) => {
      if (u.hasAvatar) {
        newUserAvatar[u.id] = await avatarSrc(u.id);
      }
    });
    Promise.all(promises).then(() => setUserAvatar(newUserAvatar));
  }, [projectUsers, setUserAvatar]);

  useEffect(() => {
    setSortedUsers([...projectUsers].sort(compareUsers));
  }, [compareUsers, projectUsers, setSortedUsers]);

  function hasProjectPermission(
    userRoleId: string,
    permission: Permission
  ): boolean {
    const userRole = projUserRoles.find((role) => role.id === userRoleId);
    if (userRole) {
      return userRole.permissions.includes(permission);
    }
    return false;
  }

  const currentUser = getCurrentUser();
  const currentProjectId = getProjectId();
  if (!currentUser || !currentProjectId) {
    return <Fragment />;
  }

  const currentUserIsProjectAdmin = hasProjectPermission(
    currentUser.projectRoles[currentProjectId],
    Permission.DeleteEditSettingsAndUsers
  );
  const currentUserIsProjectOwner = hasProjectPermission(
    currentUser.projectRoles[currentProjectId],
    Permission.Owner
  );

  const userListItem = (user: User): ReactElement => {
    const userIsProjectAdmin = hasProjectPermission(
      user.projectRoles[currentProjectId],
      Permission.DeleteEditSettingsAndUsers
    );
    const userIsProjectOwner = hasProjectPermission(
      user.projectRoles[currentProjectId],
      Permission.Owner
    );

    const manageUser =
      currentUserIsProjectAdmin &&
      user.id !== currentUser.id &&
      !userIsProjectOwner &&
      (!userIsProjectAdmin || currentUserIsProjectOwner) ? (
        <CancelConfirmDialogCollection
          userId={user.id}
          currentUserId={currentUser.id}
          isProjectOwner={currentUserIsProjectOwner}
          userIsProjectAdmin={userIsProjectAdmin}
        />
      ) : (
        <IconButton disabled size="large">
          <MoreVert />
        </IconButton>
      );

    const displayString =
      currentUserIsProjectOwner || currentUser.isAdmin
        ? `${user.name} (${user.username} | ${user.email})`
        : `${user.name} (${user.username})`;

    return (
      <ListItem key={user.id}>
        <Avatar
          alt="User Avatar"
          src={userAvatar[user.id]}
          style={{ marginRight: theme.spacing(1) }}
        />
        <ListItemText primary={displayString} />
        {manageUser}
      </ListItem>
    );
  };

  return (
    <>
      <SortOptions
        includeEmail={currentUserIsProjectOwner || currentUser.isAdmin}
        onChange={(e: SelectChangeEvent<UserOrder>) => {
          setUserOrder(e.target.value as UserOrder);
          setReverseSorting(false);
        }}
        onReverseClick={() => setReverseSorting(!reverseSorting)}
      />
      <List>{sortedUsers.map(userListItem)}</List>
    </>
  );
}
