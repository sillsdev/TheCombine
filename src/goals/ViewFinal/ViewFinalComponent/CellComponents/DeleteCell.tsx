import React from "react";
import {
  LocalizeContextProps,
  Translate,
  withLocalize
} from "react-localize-redux";
import {
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button
} from "@material-ui/core";
import { Delete } from "@material-ui/icons";

import AlignedList from "./AlignedList";
import { ViewFinalWord } from "../ViewFinalComponent";

interface DeleteCellProps {
  rowData: ViewFinalWord;
  delete: (id: string, deleteIndex: number) => void;
}

interface DeleteCellState {
  deleteSenseIndex: number;
}

class DeleteCell extends React.Component<
  DeleteCellProps & LocalizeContextProps,
  DeleteCellState
> {
  constructor(props: DeleteCellProps & LocalizeContextProps) {
    super(props);
    this.state = { deleteSenseIndex: -1 };
  }

  close() {
    this.setState({ deleteSenseIndex: -1 });
  }

  render() {
    return (
      <AlignedList
        contents={this.props.rowData.senses.map((value, index) => (
          <React.Fragment>
            <Chip
              label={<Delete />}
              onClick={event => {
                this.setState({ deleteSenseIndex: index });
              }}
            />

            {/* Confirm delete dialog */}
            <Dialog open={this.state.deleteSenseIndex !== -1}>
              <DialogTitle>
                <Translate id="viewFinal.deleteSense.title" />
              </DialogTitle>
              <DialogContent>
                <Translate id="viewFinal.deleteSense.message" />
              </DialogContent>
              <DialogActions>
                <Button onClick={() => this.close()} color="primary">
                  <Translate id="viewFinal.deleteSense.cancel" />
                </Button>
                <Button
                  onClick={() => {
                    this.props.delete(
                      this.props.rowData.id,
                      this.state.deleteSenseIndex
                    );
                    this.close();
                  }}
                  color="primary"
                  autoFocus
                >
                  <Translate id="viewFinal.deleteSense.delete" />
                </Button>
              </DialogActions>
            </Dialog>
          </React.Fragment>
        ))}
        bottomCell={undefined}
      />
    );
  }
}

export default withLocalize(DeleteCell);
