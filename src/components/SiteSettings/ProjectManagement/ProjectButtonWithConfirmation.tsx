import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@material-ui/core";
import { ButtonProps } from "@material-ui/core/Button";
import React from "react";
import { Translate } from "react-localize-redux";

import { archiveProject, restoreProject } from "../../../backend";
import LoadingButton from "../../Buttons/LoadingButton";

interface ProjectButtonWithConfirmationProps {
  archive: boolean;
  projectId: string;
  updateParent: () => void;
}

/**
 * Button for archiving/restoring project (changing isActive)
 */
export default function ProjectButtonWithConfirmation(
  props: ButtonProps & ProjectButtonWithConfirmationProps
) {
  const [loading, setLoading] = React.useState<boolean>(false);

  async function updateProj() {
    setLoading(true);
    if (props.archive) {
      await archiveProject(props.projectId);
    } else {
      await restoreProject(props.projectId);
    }
    setLoading(false);
    props.updateParent();
    handleClose();
  }

  const [open, setOpen] = React.useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <React.Fragment>
      <Button variant="contained" color="primary" onClick={handleClickOpen}>
        <Translate id={`buttons.${props.archive ? "archive" : "restore"}`} />
      </Button>
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          <Translate id="siteSettings.proceedWithCaution" />
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            <Translate
              id={`siteSettings.${
                props.archive ? "archive" : "restore"
              }ProjectText`}
            />
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} variant="outlined" color="primary">
            <Translate id="buttons.cancel" />
          </Button>
          <LoadingButton
            onClick={updateProj}
            color="primary"
            variant="contained"
            loading={loading}
            {...props}
          >
            <Translate id="buttons.confirm" />
          </LoadingButton>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
}
