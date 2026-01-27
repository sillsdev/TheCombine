import { Button } from "@mui/material";
import { ButtonProps } from "@mui/material/Button";
import { ReactElement, useState } from "react";
import { useTranslation } from "react-i18next";

import { archiveProject, restoreProject } from "backend";
import CancelConfirmDialog from "components/Dialogs/CancelConfirmDialog";
import { themeColors } from "types/theme";

interface ProjectArchiveProps extends ButtonProps {
  archive?: boolean;
  projectId: string;
  updateParent: () => void | Promise<void>;
  warn?: boolean;
}

/**
 * Button for archiving/restoring project (changing isActive)
 */
export default function ProjectArchive(
  props: ProjectArchiveProps
): ReactElement {
  const [open, setOpen] = useState(false);
  const { t } = useTranslation();

  async function updateProj(): Promise<void> {
    if (props.archive) {
      await archiveProject(props.projectId);
    } else {
      await restoreProject(props.projectId);
    }
    setOpen(false);
    await props.updateParent();
  }

  return (
    <>
      <Button
        variant="contained"
        color={props.warn ? "secondary" : "primary"}
        onClick={() => setOpen(true)}
        id={`proj-${props.projectId}-${props.archive ? "archive" : "restore"}`}
        style={props.warn ? { color: themeColors.error } : {}}
      >
        {t(props.archive ? "buttons.archive" : "buttons.restore")}
      </Button>
      <CancelConfirmDialog
        open={open}
        text={t(
          props.archive
            ? "siteSettings.archiveProjectText"
            : "siteSettings.restoreProjectText"
        )}
        handleCancel={() => setOpen(false)}
        handleConfirm={updateProj}
        buttonIdCancel={`proj-${props.projectId}-${
          props.archive ? "archive" : "restore"
        }-cancel`}
        buttonIdConfirm={`proj-${props.projectId}-${
          props.archive ? "archive" : "restore"
        }-confirm`}
      />
    </>
  );
}
