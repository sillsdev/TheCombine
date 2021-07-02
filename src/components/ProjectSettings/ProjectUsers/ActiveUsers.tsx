import {
  Avatar,
  FormControl,
  InputLabel,
  List,
  ListItem,
  ListItemText,
  MenuItem,
  Select,
} from "@material-ui/core";
import { Translate } from "react-localize-redux";
import React from "react";

import { Project, User } from "api/models";
import { avatarSrc, getAllUsersInCurrentProject } from "backend";
import theme from "types/theme";

enum UserOrder {
  Username,
  Name,
}

interface UserProps {
  project: Project;
}

interface UserState {
  projUsers: User[];
  userAvatar: { [key: string]: string };
  userOrder: UserOrder;
}

export default class ActiveUsers extends React.Component<UserProps, UserState> {
  constructor(props: UserProps) {
    super(props);
    this.state = {
      projUsers: [],
      userAvatar: {},
      userOrder: UserOrder.Username,
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

  private getSortedUsers() {
    const users = this.state.projUsers;

    // Need to make a copy of the "projUser" field in the state because sort()
    // mutates
    return users.slice(0).sort((a: User, b: User) => {
      switch (this.state.userOrder) {
        case UserOrder.Name:
          return a.name.localeCompare(b.name);
        case UserOrder.Username:
          return a.username.localeCompare(b.username);
        default:
          throw new Error();
      }
    });
  }

  render() {
    return (
      <React.Fragment>
        <FormControl style={{ minWidth: 100 }}>
          <InputLabel id="sorting-order-select">
            <Translate id="charInventory.sortBy" />
          </InputLabel>
          <Select
            labelId="sorting-order-select"
            defaultValue={UserOrder.Username}
            onChange={(event: React.ChangeEvent<{ value: unknown }>) => {
              this.setState({
                userOrder: event.target.value as UserOrder,
              });
            }}
          >
            <MenuItem value={UserOrder.Name}>
              <Translate id="projectSettings.language.name" />
            </MenuItem>
            <MenuItem value={UserOrder.Username}>
              <Translate id="login.username" />
            </MenuItem>
          </Select>
        </FormControl>
        <List>
          {this.getSortedUsers().map((user) => (
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
      </React.Fragment>
    );
  }
}
