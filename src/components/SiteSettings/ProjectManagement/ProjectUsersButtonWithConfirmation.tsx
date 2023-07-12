import { Close } from "@mui/icons-material";
import {
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { asyncRefreshProjectUsers } from "components/Project/ProjectActions";
import ActiveProjectUsers from "components/ProjectSettings/ProjectUsers/ActiveProjectUsers";
import { useAppDispatch } from "types/hooks";
import theme from "types/theme";

interface ProjectUsersButtonWithConfirmationProps {
  projectId: string;
}

/**
 * Button for managing user roles in a project.
 */
export default function ProjectUsersButtonWithConfirmation(
  props: ProjectUsersButtonWithConfirmationProps
) {
  const [open, setOpen] = useState(false);
  const { t } = useTranslation();

  return (
    <>
      <Button
        variant="contained"
        color={"primary"}
        onClick={() => setOpen(true)}
        id={`proj-${props.projectId}-users`}
        style={{ marginLeft: theme.spacing(1), marginRight: theme.spacing(1) }}
      >
        {t("siteSettings.projectRoles")}
      </Button>
      <Dialog maxWidth={false} onClose={() => setOpen(false)} open={open}>
        <DialogTitle>
          {t("siteSettings.projectRoles")}
          <IconButton
            aria-label="close"
            onClick={() => setOpen(false)}
            sx={{ position: "absolute", right: 8, top: 8 }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <ProjUsersDialogContent projectId={props.projectId} />
      </Dialog>
    </>
  );
}

function ProjUsersDialogContent(props: { projectId: string }) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(asyncRefreshProjectUsers(props.projectId));
  }, [dispatch, props.projectId]);

  return (
    <DialogContent>
      <ActiveProjectUsers projectId={props.projectId} />
    </DialogContent>
  );
}
