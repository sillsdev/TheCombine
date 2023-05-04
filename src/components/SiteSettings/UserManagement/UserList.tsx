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
import React, { ReactElement, useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { User } from "api/models";
import { getUserId } from "backend/localStorage";
import SortOptions, {
  UserOrder,
} from "components/ProjectSettings/ProjectUsers/SortOptions";
import { doesTextMatchUser } from "components/ProjectSettings/ProjectUsers/UserList";
import { Hash } from "types/hash";
import theme from "types/theme";

interface UserListProps {
  allUsers: User[];
  userAvatar: Hash<string>;
  handleOpenModal: (user: User) => void;
}

export default function UserList(props: UserListProps) {
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [reverseSorting, setReverseSorting] = useState<boolean>(false);
  const [sortedUsers, setSortedUsers] = useState<User[]>([]);
  const [userOrder, setUserOrder] = useState(UserOrder.Username);
  const { t } = useTranslation();

  const updateUsers = (filter: string): void => {
    if (filter.length >= 1) {
      setFilteredUsers(
        props.allUsers.filter((u) => doesTextMatchUser(filter, u))
      );
    } else {
      setFilteredUsers([]);
    }
  };

  const compareUsers = useCallback(
    (a: User, b: User) => {
      const reverse = reverseSorting ? -1 : 1;
      switch (userOrder) {
        case UserOrder.Name:
          return a.name.localeCompare(b.name) * reverse;
        case UserOrder.Username:
          return a.username.localeCompare(b.username) * reverse;
        case UserOrder.Email:
          return a.email.localeCompare(b.email) * reverse;
        default:
          throw new Error();
      }
    },
    [reverseSorting, userOrder]
  );

  useEffect(() => {
    setSortedUsers([...filteredUsers].sort(compareUsers));
  }, [compareUsers, filteredUsers, setFilteredUsers]);

  const userListItem = (user: User): ReactElement => {
    return (
      <ListItem key={user.id}>
        <Avatar
          alt="User Avatar"
          src={props.userAvatar[user.id]}
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
    <React.Fragment>
      <Grid item xs={12}>
        <Typography>{t("projectSettings.invite.searchTitle")}</Typography>
        <Grid container alignItems="flex-end">
          <Input
            type="text"
            onChange={(e) => updateUsers(e.target.value)}
            placeholder={t("projectSettings.invite.searchPlaceholder")}
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
    </React.Fragment>
  );
}
