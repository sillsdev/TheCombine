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
import theme from "../../../types/theme";
import { User } from "../../../types/user";

interface UserListProps {
  allUsers: User[];
  projUsers: User[];
  userAvatar: { [key: string]: string };
  addToProject: (user: User) => void;
}

interface UserListState {
  filteredAllProjects: User[];
  filteredProjUsers: User[];
  hovering: boolean;
  hoverUserID: string;
}

class UserList extends React.Component<
  UserListProps & LocalizeContextProps,
  UserListState
> {
  constructor(props: UserListProps & LocalizeContextProps) {
    super(props);
    this.state = {
      hovering: false,
      hoverUserID: "",
      filteredAllProjects: [],
      filteredProjUsers: [],
    };
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    // Variable to hold the filtered list before putting into state
    let filteredAllUsers: User[] = [];
    let filteredProjUsers: User[] = [];

    if (event.target.value.length >= 3) {
      // Use .filter() to determine which items should be displayed
      // based on the search terms
      filteredAllUsers = this.props.allUsers.filter((item) => {
        const name = item.name.toLowerCase();
        const username = item.username.toLowerCase();
        const email = item.email.toLowerCase();
        // change search term to lowercase
        const filter = event.target.value.toLowerCase();
        // check to see if the current list item includes the search term
        // If it does, it will be added to newList. Using lowercase eliminates
        // issues with capitalization in search terms and search content
        return (
          name.includes(filter) ||
          username.includes(filter) ||
          email.includes(filter)
        );
      });

      filteredProjUsers = this.props.projUsers.filter((item) => {
        const name = item.name.toLowerCase();
        const username = item.username.toLowerCase();
        const email = item.email.toLowerCase();
        // change search term to lowercase
        const filter = event.target.value.toLowerCase();
        // check to see if the current list item includes the search term
        // If it does, it will be added to newList. Using lowercase eliminates
        // issues with capitalization in search terms and search content
        return (
          name.includes(filter) ||
          username.includes(filter) ||
          email.includes(filter)
        );
      });
    }
    // Set the filtered state based on what our rules added to newList
    this.setState({
      filteredAllProjects: filteredAllUsers,
      filteredProjUsers: filteredProjUsers,
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
          onChange={this.handleChange}
          placeholder="Search..."
        />

        <List>
          {this.state.filteredProjUsers.map((user) => (
            <ListItem
              key={user.id}
              button
              onMouseEnter={() =>
                this.setState({ hovering: true, hoverUserID: user.id })
              }
              onMouseLeave={() =>
                this.setState({ hovering: false, hoverUserID: "" })
              }
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
              {this.state.hovering && this.state.hoverUserID === user.id && (
                <Button>
                  <Translate id="projectSettings.invite.addButton" />
                </Button>
              )}
            </ListItem>
          ))}
          {this.state.filteredAllProjects.map((user) => (
            <ListItem
              key={user.id}
              button
              onMouseEnter={() =>
                this.setState({ hovering: true, hoverUserID: user.id })
              }
              onMouseLeave={() =>
                this.setState({ hovering: false, hoverUserID: "" })
              }
            >
              <ListItemText primary={`${user.name} (${user.username})`} />
              {this.state.hovering && this.state.hoverUserID === user.id && (
                <Button onClick={() => this.props.addToProject(user)}>
                  <Translate id="projectSettings.invite.addButton" />
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
