import { Grid } from "@material-ui/core";
import React from "react";
import { Translate } from "react-localize-redux";
import Modal from "react-modal";
import { toast } from "react-toastify";

import { User } from "api/models";
import { avatarSrc, deleteUser, getAllUsers } from "backend";
import ConfirmDeletion from "components/SiteSettings/UserManagement/ConfirmDeletion";
import UserList from "components/SiteSettings/UserManagement/UserList";
import { UpperRightToastContainer } from "components/Toast/UpperRightToastContainer";

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

// eslint-disable-next-line @typescript-eslint/no-empty-interface
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

  async componentDidMount() {
    Modal.setAppElement("body");
    await this.populateUsers();
  }

  handleOpenModal = (user: User) => {
    this.setState({ showModal: true, userToEdit: user });
  };

  handleCloseModal = () => {
    this.setState({ showModal: false });
  };

  async componentDidUpdate() {
    if (this.state.userToEdit !== this.state.prevUserToEdit) {
      await this.populateUsers();
      this.setState((prevState) => ({ prevUserToEdit: prevState.userToEdit }));
    }
  }

  private async populateUsers() {
    await getAllUsers()
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
      .catch((err) => {
        console.error(err);
        toast.error(<Translate id="siteSettings.populateUsers.toastFailure" />);
      });
  }

  deleteUser(userId: string) {
    deleteUser(userId)
      .then(() => {
        toast.success(<Translate id="siteSettings.deleteUser.toastSuccess" />);
        this.populateUsers();
      })
      .catch((err) => {
        console.error(err);
        toast.error(<Translate id="siteSettings.deleteUser.toastFailure" />);
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
          <UpperRightToastContainer />
        </Grid>

        <Modal
          isOpen={this.state.showModal}
          style={customStyles}
          shouldCloseOnOverlayClick
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
