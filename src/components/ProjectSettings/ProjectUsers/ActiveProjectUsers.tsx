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

import { Role, User } from "api/models";
import { avatarSrc, getUserRoles } from "backend";
import { getCurrentUser } from "backend/localStorage";
import CancelConfirmDialogCollection from "components/ProjectSettings/ProjectUsers/CancelConfirmDialogCollection";
import SortOptions, {
  UserOrder,
  getUserCompare,
} from "components/ProjectSettings/ProjectUsers/SortOptions";
import { StoreState } from "types";
import { Hash } from "types/hash";
import { useAppSelector } from "types/hooks";
import theme from "types/theme";

export default function ActiveProjectUsers(props: {
  projectId: string;
}): ReactElement {
  const projectUsers = useAppSelector(
    (state: StoreState) => state.currentProjectState.users
  );

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
    getUserRoles(props.projectId).then((userRoles) => {
      const roles: Hash<Role> = {};
      projectUsers.forEach((u) => {
        const ur = userRoles.find(
          (r) => r.id === u.projectRoles[props.projectId]
        );
        roles[u.id] = ur?.role ?? Role.None;
      });
      setUserRoles(roles);
    });
  }, [projectUsers, props.projectId]);

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

  const currentUser = getCurrentUser();
  if (!currentUser || !props.projectId) {
    return <Fragment />;
  }

  const currentIsProjOwner = userRoles[currentUser.id] === Role.Owner;

  const userListItem = (user: User): ReactElement => {
    const userRole = userRoles[user.id];
    const canManageUser =
      userRole !== Role.Owner &&
      (currentIsProjOwner ||
        currentUser.isAdmin ||
        userRole !== Role.Administrator);

    const manageUser = canManageUser ? (
      <CancelConfirmDialogCollection
        currentUserId={currentUser.id}
        isProjectOwner={currentIsProjOwner}
        projectId={props.projectId}
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
