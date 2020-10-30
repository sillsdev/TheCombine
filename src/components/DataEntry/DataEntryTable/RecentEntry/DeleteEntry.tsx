import { IconButton, Tooltip } from "@material-ui/core";
import { Delete } from "@material-ui/icons";
import React from "react";
import { Translate } from "react-localize-redux";

import DeleteDialog from "../../../Buttons/DeleteDialog";

interface DeleteEntryProps {
  removeEntry: () => void;
}

/**
 * A delete button
 */
export default function DeleteEntry(props: DeleteEntryProps) {
  const [open, setOpen] = React.useState<boolean>(false);

  return (
    <React.Fragment>
      <Tooltip title={<Translate id="addWords.deleteRow" />} placement="top">
        <IconButton tabIndex={-1} size="small" onClick={() => setOpen(true)}>
          <Delete />
        </IconButton>
      </Tooltip>
      <DeleteDialog
        open={open}
        textId={"addWords.deleteRowWarning"}
        handleCancel={() => setOpen(false)}
        handleAccept={props.removeEntry}
      />
    </React.Fragment>
  );
}
