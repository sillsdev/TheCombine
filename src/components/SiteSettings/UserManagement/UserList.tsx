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
import { WithTranslation, withTranslation } from "react-i18next";

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
  UserListProps & WithTranslation,
  UserListState
> {
  constructor(props: UserListProps & WithTranslation) {
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
            <FormControl style={{ minWidth: 100 }}>
              <InputLabel id="sorting-order-select">
                {this.props.t("charInventory.sortBy")}
              </InputLabel>
              <Select
                labelId="sorting-order-select"
                defaultValue={UserOrder.Username}
                onChange={(event: React.ChangeEvent<{ value: unknown }>) => {
                  this.setState({ userOrder: event.target.value as UserOrder });
                }}
              >
                <MenuItem value={UserOrder.Name}>
                  {this.props.t("projectSettings.language.name")}
                </MenuItem>
                <MenuItem value={UserOrder.Username}>
                  {this.props.t("login.username")}
                </MenuItem>
                <MenuItem value={UserOrder.Email}>
                  {this.props.t("login.email")}
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

export default withTranslation()(UserList);
