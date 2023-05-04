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
import React from "react";
import { WithTranslation, withTranslation } from "react-i18next";

import { User } from "api/models";
import { getUserId } from "backend/localStorage";
import SortOptions, {
  UserOrder,
} from "components/ProjectSettings/ProjectUsers/SortOptions";
import { Hash } from "types/hash";
import theme from "types/theme";

interface UserListProps extends WithTranslation {
  allUsers: User[];
  userAvatar: Hash<string>;
  handleOpenModal: (user: User) => void;
}

interface UserListState {
  currentUserId: string;
  filterInput: string;
  filteredUsers: User[];
  prevFilterInput?: string;
  userOrder: UserOrder;
}

class UserList extends React.Component<UserListProps, UserListState> {
  constructor(props: UserListProps) {
    super(props);

    this.state = {
      currentUserId: getUserId(),
      filterInput: "",
      filteredUsers: [],
      userOrder: UserOrder.Username,
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

    this.setState({ filterInput: event, filteredUsers });
  }

  private getSortedUsers() {
    const users = this.state.filteredUsers;

    // Need to make a copy of the "users" field in the state because sort()
    // mutates
    return users.slice(0).sort((a: User, b: User) => {
      switch (this.state.userOrder) {
        case UserOrder.Name:
          return a.name.localeCompare(b.name);
        case UserOrder.Username:
          return a.username.localeCompare(b.username);
        case UserOrder.Email:
          return a.email.localeCompare(b.email);
        default:
          throw new Error();
      }
    });
  }

  render() {
    return (
      <React.Fragment>
        <Grid item xs={12}>
          <Typography>
            {this.props.t("projectSettings.invite.searchTitle")}
          </Typography>
          <Grid container alignItems="flex-end">
            <Input
              type="text"
              onChange={(e) => this.handleChange(e.target.value)}
              placeholder={this.props.t(
                "projectSettings.invite.searchPlaceholder"
              )}
            />
            <SortOptions
              includeEmail
              onChange={(e: SelectChangeEvent<UserOrder>) => {
                this.setState({ userOrder: e.target.value as UserOrder });
              }}
            />
          </Grid>
          <List>
            {this.getSortedUsers().map((user) => (
              <ListItem key={user.id}>
                <Avatar
                  alt="User Avatar"
                  src={this.props.userAvatar[user.id]}
                  style={{ marginRight: theme.spacing(1) }}
                />
                <ListItemText
                  primary={`${user.name} (${user.username} | ${user.email})`}
                />
                {user.id !== this.state.currentUserId &&
                  (user.isAdmin ? (
                    <Button disabled>
                      <VpnKey />
                    </Button>
                  ) : (
                    <Button
                      onClick={() => this.props.handleOpenModal(user)}
                      id={`user-delete-${user.username}`}
                    >
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

export default withTranslation()(UserList);
