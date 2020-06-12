import React from "react";
import {
  addUserRole,
  avatarSrc,
  getAllUsers,
  getAllUsersInCurrentProject,
} from "../../../backend";
import { getCurrentUser } from "../../../backend/localStorage";
import { Project } from "../../../types/project";
import { User } from "../../../types/user";
import UserList from "./UserList";

interface UserProps {
  project: Project;
}

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

  componentDidUpdate(prevProps: UserProps) {
    if (this.props.project.name !== prevProps.project.name) {
      this.populateUsers();
    }
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
    const currentUser = getCurrentUser();
    if (currentUser && user.id !== currentUser.id) {
      addUserRole([1, 2, 3], user).then(() => this.populateUsers());
    }
  }

  render() {
    return (
      <React.Fragment>
        <UserList
          allUsers={this.state.allUsers}
          projUsers={this.state.projUsers}
        />
        {/* <List>
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
        </List> */}
      </React.Fragment>
    );
  }
}

export default ProjectUsers;
