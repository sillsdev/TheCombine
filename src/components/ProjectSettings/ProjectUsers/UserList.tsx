import {
  Avatar,
  Button,
  Grid,
  Input,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
} from "@material-ui/core";
import { Done } from "@material-ui/icons";
import { useEffect, useState } from "react";
import { Translate } from "react-localize-redux";

import { User } from "api/models";
import { avatarSrc, getAllUsers } from "backend";
import theme from "types/theme";

interface UserListProps {
  projectUsers: User[];
  addToProject: (user: User) => void;
}

export default function UserList(props: UserListProps) {
  const [nonProjUsers, setNonProjUsers] = useState<User[]>([]);
  const [userAvatar, setUserAvatar] = useState<{ [key: string]: string }>({});
  const [filterInput, setFilterInput] = useState<string>("");
  const [hoverUserId, setHoverUserId] = useState<string>("");
  const [filteredProjUsers, setFilteredProjUsers] = useState<User[]>([]);
  const [filteredNonProjUsers, setFilteredNonProjUsers] = useState<User[]>([]);

  useEffect(() => {
    clearFilter();
    getAllUsers().then((users) =>
      setNonProjUsers(
        users.filter(
          (user) => !props.projectUsers.find((u) => u.id === user.id)
        )
      )
    );
  }, [props.projectUsers, setNonProjUsers]);

  useEffect(() => {
    const tempUserAvatar = { ...userAvatar };
    const promises = props.projectUsers.map(async (u) => {
      if (u.hasAvatar) {
        tempUserAvatar[u.id] = await avatarSrc(u.id);
      }
    });
    Promise.all(promises).then(() => setUserAvatar(tempUserAvatar));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.projectUsers, setUserAvatar]);

  function clearFilter() {
    setFilterInput("");
    setFilteredNonProjUsers([]);
    setFilteredProjUsers([]);
  }

  function handleChange(event: string) {
    setFilterInput(event);
    if (event.length >= 3) {
      const filterUsers = (users: User[]) =>
        users.filter((u) => userIncludesText(u, event));
      setFilteredNonProjUsers(filterUsers(nonProjUsers));
      setFilteredProjUsers(filterUsers(props.projectUsers));
    }
  }

  function userIncludesText(user: User, text: string): boolean {
    const filter = text.toLowerCase();
    return (
      user.name.toLowerCase().includes(filter) ||
      user.username.toLowerCase().includes(filter) ||
      user.email.toLowerCase().includes(filter)
    );
  }

  return (
    <Grid item xs={12}>
      <Typography>
        <Translate id="projectSettings.invite.searchTitle" />
      </Typography>
      <Input
        type="text"
        onChange={(e) => handleChange(e.target.value)}
        placeholder="Search..."
        value={filterInput}
      />
      <List>
        {filteredProjUsers.map((user) => (
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
              style={{ marginRight: theme.spacing(1) }}
            />
            <ListItemText primary={`${user.name} (${user.username})`} />
          </ListItem>
        ))}
        {filteredNonProjUsers.map((user) => (
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
                <Translate id="buttons.add" />
              </Button>
            )}
          </ListItem>
        ))}
      </List>
    </Grid>
  );
}
