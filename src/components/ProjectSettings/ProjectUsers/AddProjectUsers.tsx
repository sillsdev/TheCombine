import { Button, Grid, Typography } from "@mui/material";
import { Fragment, ReactElement, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import Modal from "react-modal";
import { toast } from "react-toastify";

import { Permission, User } from "api/models";
import * as backend from "backend";
import { asyncRefreshCurrentProjectUsers } from "components/Project/ProjectActions";
import EmailInvite from "components/ProjectSettings/ProjectUsers/EmailInvite";
import UserList from "components/ProjectSettings/ProjectUsers/UserList";
import { UpperRightToastContainer } from "components/Toast/UpperRightToastContainer";
import { StoreState } from "types";
import { useAppDispatch, useAppSelector } from "types/hooks";
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

export default function AddProjectUsers(): ReactElement {
  const projectUsers = useAppSelector(
    (state: StoreState) => state.currentProjectState.users
  );
  const dispatch = useAppDispatch();
  const [showModal, setShowModal] = useState<boolean>(false);
  const { t } = useTranslation();

  useEffect(() => {
    Modal.setAppElement("body");
  }, [projectUsers]);

  function addToProject(user: User): void {
    if (!projectUsers.map((u) => u.id).includes(user.id)) {
      backend
        .addOrUpdateUserRole(
          [Permission.MergeAndReviewEntries, Permission.WordEntry],
          user.id
        )
        .then(() => {
          toast.success(t("projectSettings.invite.toastSuccess"));
          dispatch(asyncRefreshCurrentProjectUsers());
        })
        .catch((err) => {
          console.error(err);
          toast.error(t("projectSettings.invite.toastFail"));
        });
    }
  }

  return (
    <Fragment>
      <Grid container spacing={1}>
        <UserList projectUsers={projectUsers} addToProject={addToProject} />
        <UpperRightToastContainer />
      </Grid>

      {RuntimeConfig.getInstance().emailServicesEnabled() && (
        <Grid container spacing={1}>
          <Grid item xs={12}>
            <Typography>{t("projectSettings.invite.or")}</Typography>
          </Grid>

          <Grid item xs={12}>
            <Button
              variant="contained"
              onClick={() => setShowModal(true)}
              id="project-user-invite"
            >
              {t("projectSettings.invite.inviteByEmailLabel")}
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
    </Fragment>
  );
}
