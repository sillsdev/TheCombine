import { DeleteForever, VpnKey } from "@mui/icons-material";
import {
  Avatar,
  Button,
  Grid,
  Input,
  List,
  ListItem,
  ListItemText,
  SelectChangeEvent,
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
} from "components/ProjectSettings/ProjectUsers/SortOptions";
import { doesTextMatchUser } from "components/ProjectSettings/ProjectUsers/UserList";
import { Hash } from "types/hash";
import theme from "types/theme";

interface UserListProps {
  allUsers: User[];
  handleOpenModal: (user: User) => void;
}

export default function UserList(props: UserListProps) {
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [filterInput, setFilterInput] = useState<string>("");
  const [reverseSorting, setReverseSorting] = useState<boolean>(false);
  const [sortedUsers, setSortedUsers] = useState<User[]>([]);
  const [userOrder, setUserOrder] = useState(UserOrder.Username);
  const [userAvatar, setUserAvatar] = useState<Hash<string>>({});
  const { t } = useTranslation();

  const compareUsers = useCallback(
    (a: User, b: User) => getUserCompare(userOrder, reverseSorting)(a, b),
    [reverseSorting, userOrder]
  );

  useEffect(() => {
    setSortedUsers([...filteredUsers].sort(compareUsers));
  }, [compareUsers, filteredUsers, setFilteredUsers]);

  useEffect(() => {
    const newUserAvatar: Hash<string> = {};
    const promises = props.allUsers.map(async (u) => {
      if (u.hasAvatar) {
        newUserAvatar[u.id] = await avatarSrc(u.id);
      }
    });
    Promise.all(promises).then(() => setUserAvatar(newUserAvatar));
  }, [props.allUsers, setUserAvatar]);

  useEffect(() => {
    setFilteredUsers(
      filterInput.length
        ? props.allUsers.filter((u) => doesTextMatchUser(filterInput, u))
        : []
    );
  }, [filterInput, props.allUsers]);

  const userListItem = (user: User): ReactElement => {
    return (
      <ListItem key={user.id}>
        <Avatar
          alt="User Avatar"
          src={userAvatar[user.id]}
          style={{ marginRight: theme.spacing(1) }}
        />
        <ListItemText
          primary={`${user.name} (${user.username} | ${user.email})`}
        />
        {user.id !== getUserId() &&
          (user.isAdmin ? (
            <Button disabled>
              <VpnKey />
            </Button>
          ) : (
            <Button
              onClick={() => props.handleOpenModal(user)}
              id={`user-delete-${user.username}`}
            >
              <DeleteForever />
            </Button>
          ))}
      </ListItem>
    );
  };

  return (
    <Grid item xs={12}>
      <Typography>{t("projectSettings.invite.searchTitle")}</Typography>
      <Grid container alignItems="flex-end">
        <Input
          type="text"
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
      </Grid>
      <List>{sortedUsers.map(userListItem)}</List>
    </Grid>
  );
}
