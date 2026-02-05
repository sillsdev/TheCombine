import { Done } from "@mui/icons-material";
import {
  Avatar,
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
} from "@mui/material";
import { ReactElement, useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { UserStub } from "api/models";
import { getUsersByFilter } from "backend";
import theme from "types/theme";
import { NormalizedTextField } from "utilities/fontComponents";
import { useUserAvatar } from "utilities/useAvatarSrc";

interface UserListProps {
  addToProject: (userId: string) => void;
  minSearchLength: number;
  projectUsers: UserStub[];
}

export default function UserList(props: UserListProps): ReactElement {
  const [filterInput, setFilterInput] = useState<string>("");
  const [filteredInProj, setFilteredInProj] = useState<UserStub[]>([]);
  const [filteredNotInProj, setFilteredNotInProj] = useState<UserStub[]>([]);
  const [hoverUserId, setHoverUserId] = useState<string>("");
  const [projUserIds, setProjUserIds] = useState<string[]>([]);

  const { t } = useTranslation();

  const { userAvatar } = useUserAvatar(props.projectUsers);

  const clearFilteredUsers = (): void => {
    setFilteredInProj([]);
    setFilteredNotInProj([]);
  };

  useEffect(() => {
    setFilterInput("");
    clearFilteredUsers();
    setProjUserIds(props.projectUsers.map((u) => u.id));
  }, [props.projectUsers]);

  const setFilteredUsers = useCallback(
    async (text: string): Promise<void> => {
      const filtered = await getUsersByFilter(text);
      const sorted = filtered.sort((a, b) => a.name.localeCompare(b.name));
      setFilteredNotInProj(sorted.filter((u) => !projUserIds.includes(u.id)));
      setFilteredInProj(sorted.filter((u) => projUserIds.includes(u.id)));
    },
    [projUserIds]
  );

  const updateUsers = async (text: string): Promise<void> => {
    setFilterInput(text);
    text = text.trim();
    if (text.length >= props.minSearchLength) {
      await setFilteredUsers(text);
    } else {
      clearFilteredUsers();
    }
  };

  const inProjListItem = (user: UserStub): ReactElement => {
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

  const notInProjListItem = (user: UserStub): ReactElement => {
    return (
      <ListItem
        key={user.id}
        onMouseEnter={() => setHoverUserId(user.id)}
        onMouseLeave={() => setHoverUserId("")}
      >
        <ListItemText primary={`${user.name} (${user.username})`} />
        {hoverUserId === user.id && (
          <Button
            onClick={() => props.addToProject(user.id)}
            id={`project-user-add-${user.username}`}
          >
            {t("buttons.add")}
          </Button>
        )}
      </ListItem>
    );
  };

  return (
    <div>
      <Typography>{t("projectSettings.invite.searchTitle")}</Typography>
      <NormalizedTextField
        onChange={(e) => updateUsers(e.target.value)}
        placeholder={t("projectSettings.invite.searchPlaceholder")}
        value={filterInput}
      />
      <List>
        {filteredInProj.map(inProjListItem)}
        {filteredNotInProj.map(notInProjListItem)}
      </List>
    </div>
  );
}
