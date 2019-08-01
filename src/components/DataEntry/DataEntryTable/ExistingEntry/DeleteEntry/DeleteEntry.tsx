import React from "react";
import { IconButton, Tooltip } from "@material-ui/core";
import {
  Translate,
  LocalizeContextProps,
  withLocalize
} from "react-localize-redux";
import { Delete } from "@material-ui/icons";

interface DeleteEntryProps {
  entryIndex: number;
  removeEntry: () => void;
}

/**
 * A delete button
 */
export class DeleteEntry extends React.Component<
  DeleteEntryProps & LocalizeContextProps
> {
  render() {
    return (
      <React.Fragment>
        <Tooltip title={<Translate id="addWords.deleteRow" />} placement="top">
          <IconButton size="small" onClick={() => this.props.removeEntry()}>
            <Delete />
          </IconButton>
        </Tooltip>
      </React.Fragment>
    );
  }
}

export default withLocalize(DeleteEntry);
