import { DeleteForever, VpnKey } from "@mui/icons-material";
import {
  Avatar,
  Button,
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
import { getUserId } from "backend/localStorage";
import SortOptions, {
  UserOrder,
  getUserCompare,
} from "components/ProjectUsers/SortOptions";
import theme from "types/theme";
import { doesTextMatchUser } from "types/user";
import { NormalizedTextField } from "utilities/fontComponents";
import { useUserAvatar } from "utilities/useAvatarSrc";

interface UserListProps {
  allUsers: User[];
  handleOpenModal: (user: User) => void;
}

export default function UserList(props: UserListProps): ReactElement {
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [filterInput, setFilterInput] = useState<string>("");
  const [reverseSorting, setReverseSorting] = useState<boolean>(false);
  const [sortedUsers, setSortedUsers] = useState<User[]>([]);
  const [userOrder, setUserOrder] = useState(UserOrder.Username);

  const { t } = useTranslation();

  const { userAvatar } = useUserAvatar(props.allUsers);

  const compareUsers = useCallback(
    (a: User, b: User): number =>
      getUserCompare(userOrder, reverseSorting)(a, b),
    [reverseSorting, userOrder]
  );

  useEffect(() => {
    setSortedUsers([...filteredUsers].sort(compareUsers));
  }, [compareUsers, filteredUsers]);

  useEffect(() => {
    setFilteredUsers(
      filterInput.length
        ? props.allUsers.filter((u) => doesTextMatchUser(filterInput, u))
        : []
    );
  }, [filterInput, props.allUsers]);

  const userListButton = (user: User): ReactElement => {
    const disabled = user.isAdmin || user.id === getUserId();
    return (
      <Button
        disabled={disabled}
        id={`user-delete-${user.username}`}
        onClick={disabled ? undefined : () => props.handleOpenModal(user)}
        style={{ minWidth: 0 }}
      >
        {disabled ? <VpnKey /> : <DeleteForever />}
      </Button>
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
