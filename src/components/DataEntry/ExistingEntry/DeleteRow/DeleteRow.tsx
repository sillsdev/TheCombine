import React from "react";
import { IconButton, Tooltip } from "@material-ui/core";
import { TranslateFunction } from "react-localize-redux";
import { Delete } from "@material-ui/icons";

interface DeleteRowProps {
  rowId: string;
  rowIndex: number;
  translate: TranslateFunction;
  removeWord: (id: string, callback?: Function) => void;
  removeRow: (id: number) => void;
}

export class DeleteRow extends React.Component<DeleteRowProps> {
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
              this.props.removeWord(this.props.rowId, () =>
                this.props.removeRow(this.props.rowIndex)
              )
            }
          >
            <Delete />
          </IconButton>
        </Tooltip>
      </React.Fragment>
    );
  }
}
