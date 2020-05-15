import React from "react";
import {
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Avatar,
} from "@material-ui/core";
import Done from "@material-ui/icons/Done";
import { User } from "../../../types/user";
import {
  getAllUsers,
  getAllUsersInCurrentProject,
  addUserRole,
  avatarSrc,
} from "../../../backend";
import theme from "../../../types/theme";

interface UserProps {}

interface UserState {
  allUsers: User[];
  projUsers: User[];
  modalOpen: boolean;
  openUser?: User;
  userAvatar: { [key: string]: string };
}

class ProjectUsers extends React.Component<UserProps, UserState> {
  constructor(props: UserProps) {
    super(props);
    this.state = {
      allUsers: [],
      projUsers: [],
      modalOpen: false,
      userAvatar: {},
    };
  }

  componentDidMount() {
    this.populateUsers();
  }

  private populateUsers() {
    getAllUsersInCurrentProject()
      .then((projUsers) => {
        this.setState({ projUsers });
        getAllUsers()
          .then((returnedUsers) => {
            this.setState({
              allUsers: returnedUsers.filter(
                (user) => !this.state.projUsers.find((u) => u.id === user.id)
              ),
            });
            returnedUsers.forEach((u: User, n: number, array: User[]) => {
              avatarSrc(u)
                .then((result) => {
                  let avatarsCopy = JSON.parse(
                    JSON.stringify(this.state.userAvatar)
                  );
                  avatarsCopy[u.id] = result;
                  this.setState({ userAvatar: avatarsCopy });
                  console.log(avatarsCopy);
                })
                .catch((err) => console.log(err));
            });
          })
          .catch((err) => console.log(err));
      })
      .catch((err) => console.log(err));
  }

  addToProject(user: User) {
    if (user.id !== this.getCurrentUser().id) {
      addUserRole([1, 2, 3], user).then(() => this.populateUsers());
    }
  }

  /** Get user from localstorage */
  getCurrentUser(): User {
    const userString = localStorage.getItem("user");
    return userString ? JSON.parse(userString) : null;
  }

  render() {
    return (
      <React.Fragment>
        <List>
          {this.state.projUsers.map((user) => (
            <ListItem button>
              <ListItemIcon>
                <Done />
              </ListItemIcon>
              <Avatar
                alt="User Avatar"
                src={this.state.userAvatar[user.id]}
                style={{ marginRight: theme.spacing(1) }}
              />
              <ListItemText primary={`${user.name} (${user.username})`} />
            </ListItem>
          ))}
          {this.state.allUsers.map((user) => (
            <ListItem button onClick={() => this.addToProject(user)}>
              <ListItemText primary={`${user.name} (${user.username})`} />
            </ListItem>
          ))}
        </List>
      </React.Fragment>
    );
  }
}

export default ProjectUsers;
