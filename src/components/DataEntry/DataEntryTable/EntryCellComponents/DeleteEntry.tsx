import { IconButton, Tooltip } from "@material-ui/core";
import { Delete } from "@material-ui/icons";
import React, { useState } from "react";
import { Translate } from "react-localize-redux";

import DeleteDialog from "../../../Buttons/DeleteDialog";

interface DeleteEntryProps {
  removeEntry: () => void;
  // confirmId is the translation id for the text of the delete confirmation popup;
  // if no confirmId is specified, then there is no popup
  // and deletion will happen when the button is pressed
  confirmId?: string;
}

/**
 * A delete button
 */
export default function DeleteEntry(props: DeleteEntryProps) {
  const [open, setOpen] = useState<boolean>(false);

  function handleClick() {
    if (props.confirmId) {
      setOpen(true);
    } else {
      props.removeEntry();
    }
  }

  return (
    <React.Fragment>
      <Tooltip title={<Translate id="addWords.deleteRow" />} placement="top">
        <IconButton tabIndex={-1} size="small" onClick={handleClick}>
          <Delete />
        </IconButton>
      </Tooltip>
      <DeleteDialog
        open={open}
        textId={props.confirmId}
        handleCancel={() => setOpen(false)}
        handleAccept={() => {
          setOpen(false);
          props.removeEntry();
        }}
      />
    </React.Fragment>
  );
}
