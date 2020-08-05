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

import { restoreProject } from "../../../backend";
import LoadingButton from "../../Buttons/LoadingButton";

interface RestoreProjectButtonProps {
  projectId: string;
  updateParent: () => void;
}

/**
 * Button for restoring an archived project (setting isActive=true)
 */
export default function RestoreProjectButton(
  props: ButtonProps & RestoreProjectButtonProps
) {
  const [loading, setLoading] = React.useState<boolean>(false);

  async function restoreProj() {
    setLoading(true);
    await restoreProject(props.projectId);
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
        <Translate id="buttons.restore" />
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
            <Translate id="siteSettings.restoreProjectText" />
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} variant="outlined" color="primary">
            <Translate id="buttons.cancel" />
          </Button>
          <LoadingButton
            onClick={restoreProj}
            color="primary"
            variant="contained"
            loading={loading}
            {...props}
          >
            <Translate id="buttons.restore" />
          </LoadingButton>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
}
