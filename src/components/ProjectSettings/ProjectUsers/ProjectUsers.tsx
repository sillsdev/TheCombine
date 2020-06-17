import { Button, Typography } from "@material-ui/core";
import React from "react";
import Modal from "react-modal";
import { toast, ToastContainer } from "react-toastify";
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
import EmailInvite from "./EmailInvite";
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
  project: Project;
}

interface UserState {
  allUsers: User[];
  projUsers: User[];
  modalOpen: boolean;
  openUser?: User;
  userAvatar: { [key: string]: string };
  showModal: boolean;
}

class ProjectUsers extends React.Component<UserProps, UserState> {
  constructor(props: UserProps) {
    super(props);
    this.state = {
      allUsers: [],
      projUsers: [],
      modalOpen: false,
      userAvatar: {},
      showModal: false,
    };

    this.handleOpenModal = this.handleOpenModal.bind(this);
    this.handleCloseModal = this.handleCloseModal.bind(this);
  }

  componentDidMount() {
    Modal.setAppElement("body");
    this.populateUsers();
  }

  handleOpenModal() {
    this.setState({ showModal: true });
  }

  handleCloseModal() {
    this.setState({ showModal: false });
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
      addUserRole([1, 2, 3], user)
        .then(() => {
          toast("Added User!");
          this.populateUsers();
        })
        .catch((err: string) => {
          console.log(err);
          toast("Failed to add user!");
        });
    }
  }

  render() {
    return (
      <React.Fragment>
        <UserList
          allUsers={this.state.allUsers}
          projUsers={this.state.projUsers}
          userAvatar={this.state.userAvatar}
          addToProject={(user: User) => this.addToProject(user)}
        />
        <Typography>OR</Typography>
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
        <Button variant="contained" onClick={this.handleOpenModal}>
          Invite by Email
        </Button>
        <Modal
          isOpen={this.state.showModal}
          contentLabel="Invite By Email"
          style={customStyles}
          shouldCloseOnOverlayClick={true}
          onRequestClose={this.handleCloseModal}
        >
          <EmailInvite />
        </Modal>
      </React.Fragment>
    );
  }
}

export default ProjectUsers;
