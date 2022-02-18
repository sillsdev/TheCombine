import {
  Avatar,
  Button,
  FormControl,
  Grid,
  Input,
  InputLabel,
  List,
  ListItem,
  ListItemText,
  MenuItem,
  Select,
  Typography,
} from "@material-ui/core";
import { DeleteForever, VpnKey } from "@material-ui/icons";
import React from "react";
import {
  LocalizeContextProps,
  Translate,
  withLocalize,
} from "react-localize-redux";

import { User } from "api/models";
import { getUserId } from "backend/localStorage";
import theme from "types/theme";

enum UserOrder {
  Username,
  Name,
  Email,
}

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
  userOrder: UserOrder;
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
            <Translate id="projectSettings.invite.searchTitle" />
          </Typography>
          <Grid container alignItems="flex-end">
            <Input
              type="text"
              onChange={(e) => this.handleChange(e.target.value)}
              placeholder={
                this.props.translate(
                  "projectSettings.invite.searchPlaceholder"
                ) as string
              }
            />
            <FormControl style={{ minWidth: 100 }}>
              <InputLabel id="sorting-order-select">
                <Translate id="charInventory.sortBy" />
              </InputLabel>
              <Select
                labelId="sorting-order-select"
                defaultValue={UserOrder.Username}
                onChange={(event: React.ChangeEvent<{ value: unknown }>) => {
                  this.setState({ userOrder: event.target.value as UserOrder });
                }}
              >
                <MenuItem value={UserOrder.Name}>
                  <Translate id="projectSettings.language.name" />
                </MenuItem>
                <MenuItem value={UserOrder.Username}>
                  <Translate id="login.username" />
                </MenuItem>
                <MenuItem value={UserOrder.Email}>
                  <Translate id="login.email" />
                </MenuItem>
              </Select>
            </FormControl>
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

export default withLocalize(UserList);
