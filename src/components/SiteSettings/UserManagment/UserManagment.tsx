import { Button, Grid, Typography, IconButton } from "@material-ui/core";
import React from "react";
import { Translate } from "react-localize-redux";
import Modal from "react-modal";
import { toast, ToastContainer } from "react-toastify";
//styles the ToastContainer so that it appears on the upper right corner with the message.
import "react-toastify/dist/ReactToastify.min.css";
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
import { Done, Clear } from "@material-ui/icons";
import { useRouteMatch } from "react-router-dom";
const customStyles = {
  content: {
    top: "50%",
    left: "50%",
    right: "auto",
    bottom: "auto",
    marginRight: "-50%",
    transform: "translate(-50%, -50%)",
  },
};

interface UserProps {
  //project?: Project;
}

interface UserState {
  allUsers: User[];
  modalOpen: boolean;
  openUser?: User;
  userAvatar: { [key: string]: string };
  showModal: boolean;
  userToEdit?: User;
}

class UserManagment extends React.Component<UserProps, UserState> {
  constructor(props: UserProps) {
    super(props);
    this.state = {
      allUsers: [],
      modalOpen: false,
      userAvatar: {},
      showModal: false,
    };
  }

  componentDidMount() {
    Modal.setAppElement("body");
    this.populateUsers();
  }

  handleOpenModal = (user: User) => {
    this.setState({ showModal: true, userToEdit: user });
  };

  handleCloseModal = () => {
    this.setState({ showModal: false });
  };

  componentDidUpdate() {
    this.populateUsers();
  }

  private populateUsers() {
    getAllUsers()
      .then((returnedUsers) => {
        this.setState({
          allUsers: returnedUsers,
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
  }

  private deleteUser(user: User) {}

  handleConfirmDeletion() {
    let user = this.state.userToEdit;
    return (
      <React.Fragment>
        <Grid>
          <Grid item>
            <Typography>
              <Translate id="projectSettings.invite.searchTitle" />
            </Typography>
          </Grid>
          <Grid item xs={5}>
            <IconButton
              color="primary"
              onClick={() => {
                if (user) this.deleteUser(user);
              }}
            >
              <Done />
            </IconButton>
          </Grid>
          <Grid item xs={5}>
            <IconButton color="primary" onClick={() => this.handleCloseModal()}>
              <Clear />
            </IconButton>
          </Grid>
        </Grid>
      </React.Fragment>
    );
  }

  render() {
    return (
      <React.Fragment>
        <Grid container spacing={1}>
          <UserList
            allUsers={this.state.allUsers}
            userAvatar={this.state.userAvatar}
            deleteUser={(user: User) => this.deleteUser(user)}
            handleOpenModal={(user: User) => this.handleOpenModal(user)}
          />
          <ToastContainer
            position="top-right"
            autoClose={5000}
            hideProgressBar
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
          />
        </Grid>
        {/* </Grid> */}
        <Modal
          isOpen={this.state.showModal}
          style={customStyles}
          shouldCloseOnOverlayClick={true}
          onRequestClose={this.handleCloseModal}
        >
          {this.handleConfirmDeletion()}
        </Modal>
      </React.Fragment>
    );
  }
}

export default UserManagment;
