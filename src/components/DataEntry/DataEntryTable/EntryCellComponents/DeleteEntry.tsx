import { IconButton, Tooltip } from "@material-ui/core";
import { Delete } from "@material-ui/icons";
import React from "react";
import { Translate } from "react-localize-redux";

import DeleteDialog from "../../../Buttons/DeleteDialog";

interface DeleteEntryProps {
  removeEntry: () => void;
  tooltipId: string;
  confirmId?: string;
}

/**
 * A delete button
 */
export default function DeleteEntry(props: DeleteEntryProps) {
  const [open, setOpen] = React.useState<boolean>(false);

  function handleClick() {
    if (props.confirmId) {
      setOpen(true);
    } else {
      props.removeEntry();
    }
  }

  return (
    <React.Fragment>
      <Tooltip title={<Translate id={props.tooltipId} />} placement="top">
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
