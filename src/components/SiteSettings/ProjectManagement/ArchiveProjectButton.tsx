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

import { archiveProject } from "../../../backend";
import LoadingButton from "../../Buttons/LoadingButton";

interface ArchiveProjectButtonProps {
  projectId: string;
  updateParent: () => void;
}

/**
 * Button for archiving a project (setting isActive=false)
 */
export default function ArchiveProjectButton(
  props: ButtonProps & ArchiveProjectButtonProps
) {
  const [loading, setLoading] = React.useState<boolean>(false);

  async function archiveProj() {
    setLoading(true);
    await archiveProject(props.projectId);
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
        <Translate id="buttons.archive" />
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
            <Translate id="siteSettings.archiveProjectText" />
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} variant="outlined" color="primary">
            <Translate id="buttons.cancel" />
          </Button>
          <LoadingButton
            onClick={archiveProj}
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
