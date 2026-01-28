import {
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemIcon,
  ListItemText,
  SelectChangeEvent,
  Stack,
  Typography,
} from "@mui/material";
import { ReactElement, useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { User } from "api/models";
import { avatarSrc } from "backend";
import { getUserId } from "backend/localStorage";
import SortOptions, {
  UserOrder,
  getUserCompare,
} from "components/ProjectUsers/SortOptions";
import UserActionsMenu from "components/SiteSettings/UserManagement/UserActionsMenu";
import { Hash } from "types/hash";
import theme from "types/theme";
import { doesTextMatchUser } from "types/user";
import { NormalizedTextField } from "utilities/fontComponents";

interface UserListProps {
  allUsers: User[];
  handleOpenDeleteModal: (user: User) => void;
  handleOpenProjectsModal: (user: User) => void;
}

export default function UserList(props: UserListProps): ReactElement {
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [filterInput, setFilterInput] = useState<string>("");
  const [reverseSorting, setReverseSorting] = useState<boolean>(false);
  const [sortedUsers, setSortedUsers] = useState<User[]>([]);
  const [userOrder, setUserOrder] = useState(UserOrder.Username);
  const [userAvatar, setUserAvatar] = useState<Hash<string>>({});
  const { t } = useTranslation();

  const compareUsers = useCallback(
    (a: User, b: User): number =>
      getUserCompare(userOrder, reverseSorting)(a, b),
    [reverseSorting, userOrder]
  );

  useEffect(() => {
    setSortedUsers([...filteredUsers].sort(compareUsers));
  }, [compareUsers, filteredUsers]);

  useEffect(() => {
    const newUserAvatar: Hash<string> = {};
    const promises = props.allUsers.map(async (u) => {
      if (u.hasAvatar) {
        newUserAvatar[u.id] = await avatarSrc(u.id);
      }
    });
    Promise.all(promises).then(() => setUserAvatar(newUserAvatar));
  }, [props.allUsers]);

  useEffect(() => {
    setFilteredUsers(
      filterInput.length
        ? props.allUsers.filter((u) => doesTextMatchUser(filterInput, u))
        : []
    );
  }, [filterInput, props.allUsers]);

  const userListButton = (user: User): ReactElement => {
    const disableDelete = user.isAdmin || user.id === getUserId();
    return (
      <UserActionsMenu
        user={user}
        disableDelete={disableDelete}
        onDeleteClick={() => props.handleOpenDeleteModal(user)}
        onProjectsClick={() => props.handleOpenProjectsModal(user)}
      />
    );
  };

  const userListItem = (user: User): ReactElement => {
    return (
      <ListItem key={user.id}>
        <ListItemIcon>{userListButton(user)}</ListItemIcon>
        <ListItemAvatar>
          <Avatar
            alt="User Avatar"
            src={userAvatar[user.id]}
            style={{ marginInlineEnd: theme.spacing(1) }}
          />
        </ListItemAvatar>
        <ListItemText
          primary={`${user.name} (${user.username} | ${user.email})`}
        />
      </ListItem>
    );
  };

  return (
    <>
      <Typography>{t("projectSettings.invite.searchTitle")}</Typography>
      <Stack alignItems="flex-end" direction="row">
        <NormalizedTextField
          onChange={(e) => setFilterInput(e.target.value)}
          placeholder={t("projectSettings.invite.searchPlaceholder")}
          value={filterInput}
        />
        <SortOptions
          includeEmail
          onChange={(e: SelectChangeEvent<UserOrder>) =>
            setUserOrder(e.target.value as UserOrder)
          }
          onReverseClick={() => setReverseSorting(!reverseSorting)}
        />
      </Stack>
      <List>{sortedUsers.map(userListItem)}</List>
    </>
  );
}
