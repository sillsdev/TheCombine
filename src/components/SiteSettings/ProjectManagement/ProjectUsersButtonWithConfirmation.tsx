import {
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  Typography,
} from "@mui/material";
import { ReactElement, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { CloseButton } from "components/Buttons";
import { asyncRefreshProjectUsers } from "components/Project/ProjectActions";
import ActiveProjectUsers from "components/ProjectUsers/ActiveProjectUsers";
import AddProjectUsers from "components/ProjectUsers/AddProjectUsers";
import { useAppDispatch } from "rootRedux/hooks";
import theme from "types/theme";

interface ProjectUsersButtonWithConfirmationProps {
  projectId: string;
}

/** Button for managing user roles in a project. */
export default function ProjectUsersButtonWithConfirmation(
  props: ProjectUsersButtonWithConfirmationProps
): ReactElement {
  const [open, setOpen] = useState(false);
  const { t } = useTranslation();

  return (
    <>
      <Button
        variant="contained"
        color={"primary"}
        onClick={() => setOpen(true)}
        id={`proj-${props.projectId}-users`}
        style={{ marginInline: theme.spacing(1) }}
      >
        {t("siteSettings.projectRoles")}
      </Button>
      <Dialog maxWidth={false} onClose={() => setOpen(false)} open={open}>
        <DialogTitle variant="h5">
          {t("siteSettings.projectRoles")}
          <CloseButton close={() => setOpen(false)} />
        </DialogTitle>

        <ProjUsersDialogContent projectId={props.projectId} />
      </Dialog>
    </>
  );
}

function ProjUsersDialogContent(props: { projectId: string }): ReactElement {
  const dispatch = useAppDispatch();

  const { t } = useTranslation();

  useEffect(() => {
    dispatch(asyncRefreshProjectUsers(props.projectId));
  }, [dispatch, props.projectId]);

  return (
    <DialogContent>
      <ActiveProjectUsers projectId={props.projectId} />
      <Divider sx={{ my: 2 }} />
      <Typography variant="h6" sx={{ mb: 1 }}>
        {t("siteSettings.addProjectUsers")}
      </Typography>
      <AddProjectUsers projectId={props.projectId} siteAdmin />
    </DialogContent>
  );
}
