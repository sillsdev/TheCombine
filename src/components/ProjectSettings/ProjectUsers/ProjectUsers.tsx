import React from "react";
import { List, ListItem, ListItemText } from "@material-ui/core";

import { User } from "../../../types/user";
import { getAllUsers, addUserRole } from "../../../backend";

interface UserProps {}

interface UserState {
  allUsers: User[];
  modalOpen: boolean;
  openUser?: User;
}

class ProjectUsers extends React.Component<UserProps, UserState> {
  constructor(props: UserProps) {
    super(props);
    this.state = {
      allUsers: [],
      modalOpen: false
    };
  }

  componentDidMount() {
    getAllUsers()
      .then(allUsers => this.setState({ allUsers }))
      .catch(err => console.log(err));
  }

  addToProject(user: User) {
    addUserRole([1, 2, 3], user);
  }

  render() {
    return (
      <React.Fragment>
        <List>
          {this.state.allUsers.map(user => (
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
