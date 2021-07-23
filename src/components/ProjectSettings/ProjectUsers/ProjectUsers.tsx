import { Button, Grid, Typography } from "@material-ui/core";
import React, { useEffect, useState } from "react";
import { Translate } from "react-localize-redux";
import Modal from "react-modal";
import { useSelector } from "react-redux";
import { toast, ToastContainer } from "react-toastify";
//styles the ToastContainer so that it appears on the upper right corner with the message.
import "react-toastify/dist/ReactToastify.min.css";

import { Permission, User } from "api/models";
import * as backend from "backend";
import { getUserId } from "backend/localStorage";
import EmailInvite from "components/ProjectSettings/ProjectUsers/EmailInvite";
import UserList from "components/ProjectSettings/ProjectUsers/UserList";
import { RuntimeConfig } from "types/runtimeConfig";
import { StoreState } from "types";

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

export default function ProjectUsers() {
  const projectId = useSelector((state: StoreState) => state.currentProject.id);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [projUsers, setProjUsers] = useState<User[]>([]);
  const [userAvatar, setUserAvatar] = useState<{ [key: string]: string }>({});
  const [showModal, setShowModal] = useState<boolean>(false);

  useEffect(() => {
    Modal.setAppElement("body");
    populateUsers();
  }, [projectId, setProjUsers]);

  useEffect(() => {
    backend
      .getAllUsers()
      .then((returnedUsers) =>
        setAllUsers(
          returnedUsers.filter(
            (user) => !projUsers.find((u) => u.id === user.id)
          )
        )
      );
  }, [projUsers, setAllUsers]);

  useEffect(() => {
    const tempUserAvatar = { ...userAvatar };
    const promises = projUsers.map(async (u) => {
      if (u.hasAvatar) {
        tempUserAvatar[u.id] = await backend.avatarSrc(u.id);
      }
    });
    Promise.all(promises).then(() => setUserAvatar(tempUserAvatar));
  }, [allUsers, setUserAvatar]);

  const populateUsers = () =>
    backend.getAllUsersInCurrentProject().then(setProjUsers);

  function addToProject(user: User) {
    const currentUserId: string = getUserId();
    if (user.id !== currentUserId) {
      backend
        .addOrUpdateUserRole(
          [Permission.MergeAndCharSet, Permission.Unused, Permission.WordEntry],
          user.id
        )
        .then(() => {
          toast(<Translate id="projectSettings.invite.toastSuccess" />);
          populateUsers();
        })
        .catch((err: string) => {
          console.log(err);
          toast(<Translate id="projectSettings.invite.toastFail" />);
        });
    }
  }

  return (
    <React.Fragment>
      <Grid container spacing={1}>
        <UserList
          allUsers={allUsers}
          projUsers={projUsers}
          userAvatar={userAvatar}
          addToProject={addToProject}
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
            <Button variant="contained" onClick={() => setShowModal(true)}>
              <Translate id="projectSettings.invite.inviteByEmailLabel" />
            </Button>
          </Grid>
        </Grid>
      )}

      {RuntimeConfig.getInstance().emailServicesEnabled() && (
        <Modal
          isOpen={showModal}
          style={customStyles}
          shouldCloseOnOverlayClick={true}
          onRequestClose={() => setShowModal(false)}
        >
          <EmailInvite close={() => setShowModal(false)} />
        </Modal>
      )}
    </React.Fragment>
  );
}
