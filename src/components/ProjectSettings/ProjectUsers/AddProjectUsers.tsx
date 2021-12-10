import { Button, Grid, Typography } from "@material-ui/core";
import React, { useEffect, useState } from "react";
import { Translate } from "react-localize-redux";
import Modal from "react-modal";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";

import { Permission, User } from "api/models";
import * as backend from "backend";
import { asyncRefreshCurrentProjectUsers } from "components/Project/ProjectActions";
import EmailInvite from "components/ProjectSettings/ProjectUsers/EmailInvite";
import UserList from "components/ProjectSettings/ProjectUsers/UserList";
import { UpperRightToastContainer } from "components/Toast/UpperRightToastContainer";
import { StoreState } from "types";
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

export default function AddProjectUsers() {
  const projectUsers = useSelector(
    (state: StoreState) => state.currentProjectState.users
  );
  const dispatch = useDispatch();
  const [showModal, setShowModal] = useState<boolean>(false);

  useEffect(() => {
    Modal.setAppElement("body");
  }, [projectUsers]);

  function addToProject(user: User) {
    if (!projectUsers.map((u) => u.id).includes(user.id)) {
      backend
        .addOrUpdateUserRole(
          [Permission.MergeAndReviewEntries, Permission.WordEntry],
          user.id
        )
        .then(() => {
          toast.success(<Translate id="projectSettings.invite.toastSuccess" />);
          dispatch(asyncRefreshCurrentProjectUsers());
        })
        .catch((err) => {
          console.error(err);
          toast.error(<Translate id="projectSettings.invite.toastFail" />);
        });
    }
  }

  return (
    <React.Fragment>
      <Grid container spacing={1}>
        <UserList projectUsers={projectUsers} addToProject={addToProject} />
        <UpperRightToastContainer />
      </Grid>

      {RuntimeConfig.getInstance().emailServicesEnabled() && (
        <Grid container spacing={1}>
          <Grid item xs={12}>
            <Typography>
              <Translate id="projectSettings.invite.or" />
            </Typography>
          </Grid>

          <Grid item xs={12}>
            <Button
              variant="contained"
              onClick={() => setShowModal(true)}
              id="project-user-invite"
            >
              <Translate id="projectSettings.invite.inviteByEmailLabel" />
            </Button>
          </Grid>
        </Grid>
      )}

      {RuntimeConfig.getInstance().emailServicesEnabled() && (
        <Modal
          isOpen={showModal}
          style={customStyles}
          shouldCloseOnOverlayClick
          onRequestClose={() => setShowModal(false)}
        >
          <EmailInvite
            addToProject={addToProject}
            close={() => setShowModal(false)}
          />
        </Modal>
      )}
    </React.Fragment>
  );
}
