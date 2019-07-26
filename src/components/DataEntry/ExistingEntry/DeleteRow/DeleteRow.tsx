import React from "react";
import { IconButton, Tooltip } from "@material-ui/core";

import {
  Translate,
  TranslateFunction,
  LocalizeContextProps,
  withLocalize
} from "react-localize-redux";
import { Delete } from "@material-ui/icons";

export class DeleteRow extends React.Component {
  render() {
    return (
      <React.Fragment>
        <Tooltip
          title={this.props.translate("addWords.deleteRow") as string}
          placement="top"
        >
          <IconButton
            size="small"
            onClick={() =>
              this.removeWord(row.id, () => this.removeRow(rowIndex))
            }
          >
            <Delete />
          </IconButton>
        </Tooltip>
      </React.Fragment>
    );
  }
}
