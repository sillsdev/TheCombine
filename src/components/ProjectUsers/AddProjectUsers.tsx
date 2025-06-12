import { Button, Grid, Typography } from "@mui/material";
import { ReactElement, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import Modal from "react-modal";
import { toast } from "react-toastify";

import { Role } from "api/models";
import * as backend from "backend";
import { asyncRefreshProjectUsers } from "components/Project/ProjectActions";
import EmailInvite from "components/ProjectUsers/EmailInvite";
import UserList from "components/ProjectUsers/UserList";
import { useAppDispatch, useAppSelector } from "rootRedux/hooks";
import { type StoreState } from "rootRedux/types";
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

interface AddProjectUsersProps {
  projectId: string;
  siteAdmin?: boolean;
}

export default function AddProjectUsers(
  props: AddProjectUsersProps
): ReactElement {
  const projectUsers = useAppSelector(
    (state: StoreState) => state.currentProjectState.users
  );
  const dispatch = useAppDispatch();
  const [showModal, setShowModal] = useState<boolean>(false);
  const { t } = useTranslation();

  useEffect(() => {
    Modal.setAppElement("body");
  }, [projectUsers]);

  function addToProject(userId: string): void {
    if (!projectUsers.some((u) => u.id === userId)) {
      backend
        .addOrUpdateUserRole(props.projectId, Role.Harvester, userId)
        .then(() => {
          toast.success(t("projectSettings.invite.toastSuccess"));
          dispatch(asyncRefreshProjectUsers(props.projectId));
        })
        .catch((err) => {
          console.error(err);
          toast.error(t("projectSettings.invite.toastFail"));
        });
    }
  }

  return (
    <>
      <Grid container spacing={1}>
        <UserList
          addToProject={addToProject}
          minSearchLength={props.siteAdmin ? 1 : 3}
          projectUsers={projectUsers}
        />
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
    </>
  );
}
