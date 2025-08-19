import { Email } from "@mui/icons-material";
import { Button, IconButton, Stack, Typography } from "@mui/material";
import { ReactElement, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import Modal from "react-modal";
import { toast } from "react-toastify";

import { Role } from "api/models";
import { addOrUpdateUserRole } from "backend";
import { asyncRefreshProjectUsers } from "components/Project/ProjectActions";
import EmailInvite from "components/ProjectUsers/EmailInvite";
import EmailVerify from "components/ProjectUsers/EmailVerify";
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

const emailIsEnabled = RuntimeConfig.getInstance().emailServicesEnabled();

interface AddProjectUsersProps {
  projectId: string;
  siteAdmin?: boolean;
}

export default function AddProjectUsers(
  props: AddProjectUsersProps
): ReactElement {
  const emailIsVerified = useAppSelector(
    (state: StoreState) => state.loginState.isEmailVerified
  );
  const projectUsers = useAppSelector(
    (state: StoreState) => state.currentProjectState.users
  );
  const dispatch = useAppDispatch();

  const [emailVerifySent, setEmailVerifySent] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    Modal.setAppElement("body");
  }, [projectUsers]);

  function addToProject(userId: string): void {
    if (!projectUsers.some((u) => u.id === userId)) {
      addOrUpdateUserRole(props.projectId, Role.Harvester, userId)
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

  if (emailIsEnabled && !emailIsVerified) {
    const onSubmit = (): void => {
      setEmailVerifySent(true);
      setShowVerifyModal(false);
      toast.success(t("userSettings.emailVerify.verificationSent"));
    };

    return (
      <>
        <Typography>{t("userSettings.emailVerify.emailUnverified")}</Typography>

        <IconButton
          disabled={emailVerifySent}
          onClick={() => setShowVerifyModal(true)}
        >
          <Email />
        </IconButton>

        {emailVerifySent && (
          <Typography>
            {t("userSettings.emailVerify.emailVerifying")}
          </Typography>
        )}

        <Modal
          isOpen={showVerifyModal}
          onRequestClose={() => setShowVerifyModal(false)}
          style={customStyles}
        >
          <EmailVerify
            onCancel={() => setShowVerifyModal(false)}
            onSubmit={onSubmit}
          />
        </Modal>
      </>
    );
  }

  return (
    <Stack alignItems="flex-start" spacing={1}>
      <UserList
        addToProject={addToProject}
        minSearchLength={props.siteAdmin ? 1 : 3}
        projectUsers={projectUsers}
      />

      {emailIsEnabled && (
        <>
          <Typography>{t("projectSettings.invite.or")}</Typography>

          <Button
            id="project-user-invite"
            onClick={() => setShowInviteModal(true)}
            variant="contained"
          >
            {t("projectSettings.invite.inviteByEmailLabel")}
          </Button>

          <Modal
            isOpen={showInviteModal}
            onRequestClose={() => setShowInviteModal(false)}
            style={customStyles}
          >
            <EmailInvite
              addToProject={addToProject}
              close={() => setShowInviteModal(false)}
            />
          </Modal>
        </>
      )}
    </Stack>
  );
}
