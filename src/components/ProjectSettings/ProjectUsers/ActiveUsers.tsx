import { Avatar, List, ListItem, ListItemText } from "@material-ui/core";
import * as React from "react";

import { avatarSrc, getAllUsersInCurrentProject } from "backend";
import { Project } from "types/project";
import theme from "types/theme";
import { User } from "types/user";

interface UserProps {
  project: Project;
}

interface UserState {
  projUsers: User[];
  userAvatar: { [key: string]: string };
}

export default class ActiveUsers extends React.Component<UserProps, UserState> {
  constructor(props: UserProps) {
    super(props);
    this.state = {
      projUsers: [],
      userAvatar: {},
    };
  }

  componentDidMount() {
    this.populateUsers();
  }

  componentDidUpdate(prevProps: UserProps) {
    if (this.props.project.name !== prevProps.project.name) {
      this.populateUsers();
    }
  }

  private populateUsers() {
    getAllUsersInCurrentProject()
      .then(async (projUsers) => {
        this.setState({ projUsers });
        const userAvatar = this.state.userAvatar;
        const promises = projUsers.map(async (u) => {
          if (u.hasAvatar) {
            userAvatar[u.id] = await avatarSrc(u.id);
          }
        });
        await Promise.all(promises);
        this.setState({ userAvatar });
      })
      .catch((err) => console.error(err));
  }

  render() {
    return (
      <List>
        {this.state.projUsers.map((user) => (
          <ListItem key={user.id}>
            <Avatar
              alt="User Avatar"
              src={this.state.userAvatar[user.id]}
              style={{ marginRight: theme.spacing(1) }}
            />
            <ListItemText primary={`${user.name} (${user.username})`} />
          </ListItem>
        ))}
      </List>
    );
  }
}
