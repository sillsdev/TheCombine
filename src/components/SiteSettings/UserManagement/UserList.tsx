import {
  Avatar,
  Button,
  Grid,
  Input,
  List,
  ListItem,
  ListItemText,
  Typography,
} from "@material-ui/core";
import { DeleteForever, VpnKey } from "@material-ui/icons";
import * as React from "react";
import {
  LocalizeContextProps,
  Translate,
  withLocalize,
} from "react-localize-redux";

import { getUserId } from "backend/localStorage";
import theme from "types/theme";
import { User } from "types/user";

interface UserListProps {
  allUsers: User[];
  userAvatar: { [key: string]: string };
  handleOpenModal: (user: User) => void;
}

interface UserListState {
  currentUserId: string;
  filterInput: string;
  filteredUsers: User[];
  prevFilterInput?: string;
}

class UserList extends React.Component<
  UserListProps & LocalizeContextProps,
  UserListState
> {
  constructor(props: UserListProps & LocalizeContextProps) {
    super(props);

    this.state = {
      currentUserId: getUserId(),
      filterInput: "",
      filteredUsers: [],
    };
  }
  componentDidUpdate() {
    if (this.state.prevFilterInput !== this.state.filterInput) {
      this.handleChange(this.state.filterInput);
      this.setState((state) => ({ prevFilterInput: state.filterInput }));
    }
  }

  handleChange(event: string) {
    let filteredUsers: User[] = [];

    if (event.length >= 1) {
      filteredUsers = this.props.allUsers.filter((user) => {
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

    this.setState({
      filterInput: event,
      filteredUsers: filteredUsers,
    });
  }

  render() {
    return (
      <React.Fragment>
        <Grid item xs={12}>
          <Typography>
            <Translate id="projectSettings.invite.searchTitle" />
          </Typography>
          <Input
            type="text"
            onChange={(e) => this.handleChange(e.target.value)}
            placeholder="Search..."
          />

          <List>
            {this.state.filteredUsers.map((user) => (
              <ListItem key={user.id}>
                <Avatar
                  alt="User Avatar"
                  src={this.props.userAvatar[user.id]}
                  style={{ marginRight: theme.spacing(1) }}
                />
                <ListItemText primary={`${user.name} (${user.username})`} />
                {user.id !== this.state.currentUserId &&
                  (user.isAdmin ? (
                    <Button disabled>
                      <VpnKey />
                    </Button>
                  ) : (
                    <Button onClick={() => this.props.handleOpenModal(user)}>
                      <DeleteForever />
                    </Button>
                  ))}
              </ListItem>
            ))}
          </List>
        </Grid>
      </React.Fragment>
    );
  }
}

export default withLocalize(UserList);
