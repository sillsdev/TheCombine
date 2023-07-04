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

import { Role, User } from "api/models";
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

export default function ActiveProjectUsers(): ReactElement {
  const projectUsers = useSelector(
    (state: StoreState) => state.currentProjectState.users
  );

  const [projectId] = useState(getProjectId());
  const [userAvatar, setUserAvatar] = useState<Hash<string>>({});
  const [userRoles, setUserRoles] = useState<Hash<Role>>({});
  const [userOrder, setUserOrder] = useState<UserOrder>(UserOrder.Username);
  const [reverseSorting, setReverseSorting] = useState<boolean>(false);
  const [sortedUsers, setSortedUsers] = useState<User[]>([]);

  const compareUsers = useCallback(
    (a: User, b: User): number =>
      getUserCompare(userOrder, reverseSorting)(a, b),
    [reverseSorting, userOrder]
  );

  useEffect(() => {
    getUserRoles().then((userRoles) => {
      const roles: Hash<Role> = {};
      projectUsers.forEach((u) => {
        const ur = userRoles.find((r) => r.id === u.projectRoles[projectId]);
        roles[u.id] = ur?.role ?? Role.None;
      });
      setUserRoles(roles);
    });
  }, [projectId, projectUsers]);

  useEffect(() => {
    const newUserAvatar: Hash<string> = {};
    const promises = projectUsers.map(async (u) => {
      if (u.hasAvatar) {
        newUserAvatar[u.id] = await avatarSrc(u.id);
      }
    });
    Promise.all(promises).then(() => setUserAvatar(newUserAvatar));
  }, [projectUsers]);

  useEffect(() => {
    setSortedUsers([...projectUsers].sort(compareUsers));
  }, [compareUsers, projectUsers]);

  function hasProjectRole(userId: string, role: Role): boolean {
    const userRole = userRoles[userId];
    return userRole === role;
  }

  const currentUser = getCurrentUser();
  if (!currentUser || !projectId) {
    return <Fragment />;
  }

  const currentRoleId = currentUser.projectRoles[projectId];
  const currentIsProjOwner = userRoles[currentRoleId] === Role.Owner;
  const currentIsProjAdminOrOwner =
    currentIsProjOwner || hasProjectRole(currentRoleId, Role.Administrator);

  const userListItem = (user: User): ReactElement => {
    const userRole = userRoles[user.id];
    const userIsProjAdmin = userRole === Role.Administrator;
    const canManageUser =
      currentIsProjAdminOrOwner &&
      user.id !== currentUser.id &&
      userRole !== Role.Owner &&
      (!userIsProjAdmin || currentIsProjOwner);

    const manageUser = canManageUser ? (
      <CancelConfirmDialogCollection
        currentUserId={currentUser.id}
        isProjectOwner={currentIsProjOwner}
        userId={user.id}
        userRole={userRole}
      />
    ) : (
      <IconButton disabled size="large">
        <MoreVert />
      </IconButton>
    );

    const displayString =
      currentIsProjOwner || currentUser.isAdmin
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
        includeEmail={currentIsProjOwner || currentUser.isAdmin}
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
