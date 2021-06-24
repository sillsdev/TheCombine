import { Button, Grid, Typography } from "@material-ui/core";
import React from "react";
import { Translate } from "react-localize-redux";
import Modal from "react-modal";
import { toast, ToastContainer } from "react-toastify";
//styles the ToastContainer so that it appears on the upper right corner with the message.
import "react-toastify/dist/ReactToastify.min.css";

import { Permission, Project, User } from "api/models";
import * as backend from "backend";
import { getUserId } from "backend/localStorage";
import EmailInvite from "components/ProjectSettings/ProjectUsers/EmailInvite";
import UserList from "components/ProjectSettings/ProjectUsers/UserList";
import { RuntimeConfig } from "types/runtimeConfig";

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
      userAvatar: {},
      showModal: false,
    };
  }

  componentDidMount() {
    Modal.setAppElement("body");
    this.populateUsers();
  }

  handleOpenModal = () => {
    this.setState({ showModal: true });
  };

  handleCloseModal = () => {
    this.setState({ showModal: false });
  };

  componentDidUpdate(prevProps: UserProps) {
    if (this.props.project.name !== prevProps.project.name) {
      this.populateUsers();
    }
  }

  private populateUsers() {
    backend
      .getAllUsersInCurrentProject()
      .then((projUsers) => {
        this.setState({ projUsers });
        backend
          .getAllUsers()
          .then((returnedUsers) => {
            this.setState((prevState) => ({
              allUsers: returnedUsers.filter(
                (user) => !prevState.projUsers.find((u) => u.id === user.id)
              ),
            }));
            const userAvatar = this.state.userAvatar;
            const promises = projUsers.map(async (u) => {
              if (u.hasAvatar) {
                userAvatar[u.id] = await backend.avatarSrc(u.id);
              }
            });
            Promise.all(promises).then(() => {
              this.setState({ userAvatar });
            });
          })
          .catch((err) => console.error(err));
      })
      .catch((err) => console.error(err));
  }

  addToProject(user: User) {
    const currentUserId: string = getUserId();
    if (user.id !== currentUserId) {
      backend
        .addUserRole(
          [Permission.MergeAndCharSet, Permission.Unused, Permission.WordEntry],
          user.id
        )
        .then(() => {
          toast(<Translate id="projectSettings.invite.toastSuccess" />);
          this.populateUsers();
        })
        .catch((err: string) => {
          console.log(err);
          toast(<Translate id="projectSettings.invite.toastFail" />);
        });
    }
  }

  render() {
    return (
      <React.Fragment>
        <Grid container spacing={1}>
          <UserList
            allUsers={this.state.allUsers}
            projUsers={this.state.projUsers}
            userAvatar={this.state.userAvatar}
            addToProject={(user: User) => this.addToProject(user)}
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

        {RuntimeConfig.getInstance().emailServicesEnabled() && (
          <Grid container spacing={1}>
            <Grid item xs={12}>
              <Typography>
                <Translate id="projectSettings.invite.or" />
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <Button variant="contained" onClick={this.handleOpenModal}>
                <Translate id="projectSettings.invite.inviteByEmailLabel" />
              </Button>
            </Grid>
          </Grid>
        )}

        {RuntimeConfig.getInstance().emailServicesEnabled() && (
          <Modal
            isOpen={this.state.showModal}
            style={customStyles}
            shouldCloseOnOverlayClick={true}
            onRequestClose={this.handleCloseModal}
          >
            <EmailInvite close={this.handleCloseModal} />
          </Modal>
        )}
      </React.Fragment>
    );
  }
}

export default ProjectUsers;
