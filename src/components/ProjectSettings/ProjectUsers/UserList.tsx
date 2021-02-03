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
import * as React from "react";
import {
  LocalizeContextProps,
  Translate,
  withLocalize,
} from "react-localize-redux";

import theme from "types/theme";
import { User } from "types/user";

interface UserListProps {
  allUsers: User[];
  projUsers: User[];
  userAvatar: { [key: string]: string };
  addToProject: (user: User) => void;
}

interface UserListState {
  filterInput: string;
  filteredNonProjUsers: User[];
  filteredProjUsers: User[];
  hoverUserID: string;
}

class UserList extends React.Component<
  UserListProps & LocalizeContextProps,
  UserListState
> {
  constructor(props: UserListProps & LocalizeContextProps) {
    super(props);

    this.state = {
      filterInput: "",
      hoverUserID: "",
      filteredNonProjUsers: [],
      filteredProjUsers: [],
    };
  }

  handleChange(event: string) {
    let filteredNonProjUsers: User[] = [];
    let filteredProjUsers: User[] = [];

    if (event.length >= 3) {
      filteredNonProjUsers = this.filterUsers(this.props.allUsers, event);
      filteredProjUsers = this.filterUsers(this.props.projUsers, event);
    }

    this.setState({
      filterInput: event,
      filteredNonProjUsers,
      filteredProjUsers,
    });
  }

  filterUsers(users: User[], event: string): User[] {
    return users.filter((user) => {
      const name = user.name.toLowerCase();
      const username = user.username.toLowerCase();
      const email = user.email.toLowerCase();
      const filter = event.toLowerCase();

      return (
        name.includes(filter) ||
        username.includes(filter) ||
        email.includes(filter)
      );
    });
  }

  render() {
    return (
      <Grid item xs={12}>
        <Typography>
          <Translate id="projectSettings.invite.searchTitle" />
        </Typography>
        <Input
          type="text"
          onChange={(e) => this.handleChange(e.target.value)}
          placeholder="Search..."
          value={this.state.filterInput}
        />
        <List>
          {this.state.filteredProjUsers.map((user) => (
            <ListItem
              key={user.id}
              onMouseEnter={() => this.setState({ hoverUserID: user.id })}
              onMouseLeave={() => this.setState({ hoverUserID: "" })}
            >
              <ListItemIcon>
                <Done />
              </ListItemIcon>
              <Avatar
                alt="User Avatar"
                src={this.props.userAvatar[user.id]}
                style={{ marginRight: theme.spacing(1) }}
              />
              <ListItemText primary={`${user.name} (${user.username})`} />
            </ListItem>
          ))}
          {this.state.filteredNonProjUsers.map((user) => (
            <ListItem
              key={user.id}
              onMouseEnter={() => this.setState({ hoverUserID: user.id })}
              onMouseLeave={() => this.setState({ hoverUserID: "" })}
            >
              <ListItemText primary={`${user.name} (${user.username})`} />
              {this.state.hoverUserID === user.id && (
                <Button
                  onClick={() => {
                    this.props.addToProject(user);
                    this.handleChange("");
                  }}
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
}

export default withLocalize(UserList);
