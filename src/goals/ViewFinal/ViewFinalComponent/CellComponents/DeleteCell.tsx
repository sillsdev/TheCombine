import React from "react";
import { Chip } from "@material-ui/core";
import { Delete } from "@material-ui/icons";

import AlignedList, { SPACER } from "./AlignedList";
import { ViewFinalWord } from "../ViewFinalComponent";

interface DeleteCellProps {
  rowData: ViewFinalWord;
  delete: (deleteIndex: string) => void;
}

class DeleteCell extends React.Component<DeleteCellProps> {
  render() {
    return (
      <AlignedList
        contents={this.props.rowData.senses.map(value => (
          <React.Fragment>
            <Chip
              color={value.deleted ? "secondary" : "default"}
              label={<Delete />}
              onClick={() => {
                this.props.delete(value.senseId);
              }}
            />
          </React.Fragment>
        ))}
        bottomCell={SPACER}
      />
    );
  }
}

export default DeleteCell;
