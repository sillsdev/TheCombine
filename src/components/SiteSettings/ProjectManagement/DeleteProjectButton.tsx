import { ButtonProps } from "@material-ui/core/Button";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@material-ui/core";
import React from "react";
import { Translate } from "react-localize-redux";
import { deleteProject } from "../../../backend";
import LoadingButton from "../../Buttons/LoadingButton";

interface DeleteProjectButtonProps {
  projectId: string;
  updateParent: () => void;
}

/**
 * Button for deleting project from backend
 */
export default function DeleteProjectButton(
  props: ButtonProps & DeleteProjectButtonProps
) {
  const [loading, setLoading] = React.useState<boolean>(false);

  async function deleteProj() {
    setLoading(true);
    await deleteProject(props.projectId);
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
        <Translate id="siteSettings.deleteProject.button" />
      </Button>
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          <Translate id="siteSettings.deleteProject.warnTitle" />
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            <Translate id="siteSettings.deleteProject.warnText" />
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} variant="outlined" color="primary">
            <Translate id="siteSettings.deleteProject.cancel" />
          </Button>
          <LoadingButton
            onClick={deleteProj}
            color="primary"
            variant="contained"
            loading={loading}
            {...props}
          >
            <Translate id="siteSettings.deleteProject.confirm" />
          </LoadingButton>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
}
