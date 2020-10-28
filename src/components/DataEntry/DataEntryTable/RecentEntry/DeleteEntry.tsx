import { IconButton, Tooltip } from "@material-ui/core";
import { Delete } from "@material-ui/icons";
import React from "react";
import { Translate } from "react-localize-redux";

interface DeleteEntryProps {
  removeEntry: () => void;
}

/**
 * A delete button
 */
export default class DeleteEntry extends React.Component<DeleteEntryProps> {
  render() {
    return (
      <React.Fragment>
        <Tooltip title={<Translate id="addWords.deleteRow" />} placement="top">
          <IconButton
            tabIndex={-1}
            size="small"
            onClick={() => this.props.removeEntry()}
          >
            <Delete />
          </IconButton>
        </Tooltip>
      </React.Fragment>
    );
  }
}
