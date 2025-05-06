import { Done } from "@mui/icons-material";
import {
  Avatar,
  Button,
  Grid,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
} from "@mui/material";
import { ReactElement, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { User } from "api/models";
import { avatarSrc, getAllUsers } from "backend";
import { Hash } from "types/hash";
import theme from "types/theme";
import { doesTextMatchUser } from "types/user";
import { NormalizedTextField } from "utilities/fontComponents";

interface UserListProps {
  addToProject: (user: User) => void;
  minSearchLength: number;
  projectUsers: User[];
}

export default function UserList(props: UserListProps): ReactElement {
  const [nonProjUsers, setNonProjUsers] = useState<User[]>([]);
  const [filterInput, setFilterInput] = useState<string>("");
  const [filteredNonProjUsers, setFilteredNonProjUsers] = useState<User[]>([]);
  const [filteredProjUsers, setFilteredProjUsers] = useState<User[]>([]);
  const [hoverUserId, setHoverUserId] = useState<string>("");
  const [userAvatar, setUserAvatar] = useState<Hash<string>>({});

  const { t } = useTranslation();

  const clearFilter = (): void => {
    setFilterInput("");
    setFilteredNonProjUsers([]);
    setFilteredProjUsers([]);
  };

  useEffect(() => {
    clearFilter();
    getAllUsers().then((users) => {
      const projUserIds = props.projectUsers.map((u) => u.id);
      setNonProjUsers(users.filter((u) => !projUserIds.includes(u.id)));
    });
  }, [props.projectUsers]);

  useEffect(() => {
    const newUserAvatar: Hash<string> = {};
    const promises = props.projectUsers.map(async (u) => {
      if (u.hasAvatar) {
        newUserAvatar[u.id] = await avatarSrc(u.id);
      }
    });
    Promise.all(promises).then(() => setUserAvatar(newUserAvatar));
  }, [props.projectUsers]);

  const updateUsers = (text: string): void => {
    setFilterInput(text);
    if (text.length >= props.minSearchLength) {
      const filterUsers = (users: User[]): User[] =>
        users.filter((u) => doesTextMatchUser(text, u));
      setFilteredNonProjUsers(filterUsers(nonProjUsers));
      setFilteredProjUsers(filterUsers(props.projectUsers));
    } else {
      setFilteredNonProjUsers([]);
      setFilteredProjUsers([]);
    }
  };

  const projUserListItem = (user: User): ReactElement => {
    return (
      <ListItem
        key={user.id}
        onMouseEnter={() => setHoverUserId(user.id)}
        onMouseLeave={() => setHoverUserId("")}
      >
        <ListItemIcon>
          <Done />
        </ListItemIcon>
        <Avatar
          alt="User Avatar"
          src={userAvatar[user.id]}
          style={{ marginInlineEnd: theme.spacing(1) }}
        />
        <ListItemText primary={`${user.name} (${user.username})`} />
      </ListItem>
    );
  };

  const nonProjUserListItem = (user: User): ReactElement => {
    return (
      <ListItem
        key={user.id}
        onMouseEnter={() => setHoverUserId(user.id)}
        onMouseLeave={() => setHoverUserId("")}
      >
        <ListItemText primary={`${user.name} (${user.username})`} />
        {hoverUserId === user.id && (
          <Button
            onClick={() => props.addToProject(user)}
            id={`project-user-add-${user.username}`}
          >
            {t("buttons.add")}
          </Button>
        )}
      </ListItem>
    );
  };

  return (
    <Grid item xs={12}>
      <Typography>{t("projectSettings.invite.searchTitle")}</Typography>
      <NormalizedTextField
        onChange={(e) => updateUsers(e.target.value)}
        placeholder={t("projectSettings.invite.searchPlaceholder")}
        value={filterInput}
      />
      <List>
        {filteredProjUsers.map(projUserListItem)}
        {filteredNonProjUsers.map(nonProjUserListItem)}
      </List>
    </Grid>
  );
}
