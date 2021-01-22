import { Grid } from "@material-ui/core";
import React from "react";
import { Translate } from "react-localize-redux";
import Modal from "react-modal";
import { toast, ToastContainer } from "react-toastify";
//styles the ToastContainer so that it appears on the upper right corner with the message.
import "react-toastify/dist/ReactToastify.min.css";

import { avatarSrc, deleteUser, getAllUsers } from "backend";
import { User } from "types/user";
import UserList from "components/SiteSettings/UserManagement/UserList";
import ConfirmDeletion from "components/SiteSettings/UserManagement/ConfirmDeletion";

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
  openUser?: User;
  userAvatar: { [key: string]: string };
  showModal: boolean;
  userToEdit?: User;
  prevUserToEdit?: User;
}

class UserManagement extends React.Component<UserProps, UserState> {
  constructor(props: UserProps) {
    super(props);
    this.state = {
      allUsers: [],
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
      this.setState((prevState) => ({ prevUserToEdit: prevState.userToEdit }));
    }
  }

  private populateUsers() {
    getAllUsers()
      .then((allUsers) => {
        this.setState({ allUsers });
        const userAvatar = this.state.userAvatar;
        const promises = allUsers.map(async (u) => {
          if (u.hasAvatar) {
            userAvatar[u.id] = await avatarSrc(u.id);
          }
        });
        Promise.all(promises).then(() => {
          this.setState({ userAvatar });
        });
      })
      .catch((err) => console.log(err));
  }

  deleteUser(userId: string) {
    deleteUser(userId)
      .then(() => {
        toast(<Translate id="siteSettings.deleteUser.toastSuccess" />);
        this.populateUsers();
      })
      .catch((err: string) => {
        console.log(err);
        toast(<Translate id="siteSettings.deleteUser.toastFailure" />);
      });
    this.handleCloseModal();
  }

  render() {
    return (
      <React.Fragment>
        <Grid container spacing={1}>
          <UserList
            allUsers={this.state.allUsers}
            userAvatar={this.state.userAvatar}
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

        <Modal
          isOpen={this.state.showModal}
          style={customStyles}
          shouldCloseOnOverlayClick={true}
          onRequestClose={this.handleCloseModal}
        >
          <ConfirmDeletion
            user={this.state.userToEdit}
            deleteUser={(userId: string) => this.deleteUser(userId)}
            handleCloseModal={this.handleCloseModal}
          />
        </Modal>
      </React.Fragment>
    );
  }
}

export default UserManagement;
