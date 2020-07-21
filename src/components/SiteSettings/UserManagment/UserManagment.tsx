import { Button, Grid, Typography, Box } from "@material-ui/core";
import React from "react";
import { Translate } from "react-localize-redux";
import Modal from "react-modal";
import { ToastContainer } from "react-toastify";
//styles the ToastContainer so that it appears on the upper right corner with the message.
import "react-toastify/dist/ReactToastify.min.css";
import { avatarSrc, getAllUsers } from "../../../backend";
import { User } from "../../../types/user";
import UserList from "./UserList";
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

  printUserName() {
    if (this.state.userToEdit) {
      return <React.Fragment>{this.state.userToEdit.username}</React.Fragment>;
    }
  }

  private deleteUser(user: User) {}

  handleConfirmDeletion() {
    let user = this.state.userToEdit;
    return (
      <React.Fragment>
        <Grid container spacing={2} justify="center">
          <Grid item xs={12} justify="center">
            <Typography style={{ color: "primary" }}>
              <Box fontWeight="fontWeightBold">{this.printUserName()}</Box>
            </Typography>
          </Grid>
          <Grid item xs={12} justify="center">
            <Typography>
              <Box fontWeight="fontWeightBold">
                <Translate id="siteSettings.confirmDelete.title" />
              </Box>
            </Typography>
          </Grid>
          <Grid item xs={5} justify="center">
            <Button
              onClick={() => {
                if (user) this.deleteUser(user);
              }}
            >
              <Typography style={{ color: "red" }}>
                <Box fontWeight="fontWeightBold" m={1}>
                  <Translate id="siteSettings.confirmDelete.delete" />
                </Box>
              </Typography>
            </Button>
          </Grid>
          <Grid item xs={5} justify="center">
            <Button onClick={() => this.handleCloseModal()}>
              <Typography style={{ color: "inherit" }}>
                <Box fontWeight="fontWeightBold">
                  <Translate id="siteSettings.confirmDelete.cancel" />
                </Box>
              </Typography>
            </Button>
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
