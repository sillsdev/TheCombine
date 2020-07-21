import { Grid } from "@material-ui/core";
import React from "react";
import Modal from "react-modal";
import { ToastContainer } from "react-toastify";
//styles the ToastContainer so that it appears on the upper right corner with the message.
import "react-toastify/dist/ReactToastify.min.css";
import { avatarSrc, getAllUsers } from "../../../backend";
import { User } from "../../../types/user";
import UserList from "./UserList";
import ConfirmDeletion from "./ConfirmDeletion";

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

interface UserProps {}

interface UserState {
  allUsers: User[];
  modalOpen: boolean;
  openUser?: User;
  userAvatar: { [key: string]: string };
  showModal: boolean;
  userToEdit?: User;
  prevUserToEdit?: User;
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
    if (this.state.userToEdit !== this.state.prevUserToEdit) {
      this.populateUsers();
      this.setState({ prevUserToEdit: this.state.userToEdit });
    }
  }

  private populateUsers() {
    getAllUsers()
      .then((returnedUsers) => {
        this.setState({
          allUsers: returnedUsers,
        });
        returnedUsers.forEach((u: User) => {
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
          <ConfirmDeletion
            user={this.state.userToEdit}
            deleteUser={this.deleteUser}
            handleCloseModal={this.handleCloseModal}
          />
        </Modal>
      </React.Fragment>
    );
  }
}

export default UserManagment;
