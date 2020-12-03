import { Button } from "@material-ui/core";
import { ButtonProps } from "@material-ui/core/Button";
import React, { useState } from "react";
import { Translate } from "react-localize-redux";

import { archiveProject, restoreProject } from "../../../backend";
import ButtonConfirmation from "../../Buttons/ButtonConfirmation";

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
  const [open, setOpen] = useState(false);

  async function updateProj() {
    if (props.archive) {
      await archiveProject(props.projectId);
    } else {
      await restoreProject(props.projectId);
    }
    props.updateParent();
    handleClose();
  }

  function handleOpen() {
    setOpen(true);
  }
  function handleClose() {
    setOpen(false);
  }

  return (
    <React.Fragment>
      <Button variant="contained" color="primary" onClick={handleOpen}>
        <Translate id={`buttons.${props.archive ? "archive" : "restore"}`} />
      </Button>
      <ButtonConfirmation
        open={open}
        textId={`siteSettings.${
          props.archive ? "archive" : "restore"
        }ProjectText`}
        titleId="buttons.proceedWithCaution"
        onClose={handleClose}
        onConfirm={updateProj}
      ></ButtonConfirmation>
    </React.Fragment>
  );
}
