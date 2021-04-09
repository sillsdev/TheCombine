import { Button, Grid, GridList } from "@material-ui/core";
import React from "react";
import { LocalizeContextProps, withLocalize } from "react-localize-redux";

import MergeDragDrop from "goals/MergeDupGoal/MergeDupStep/DragDropComponents/MergeDragDrop";
import theme from "types/theme";

interface MergeDupStepProps {
  wordCount: number;
  advanceStep: () => void;
  clearSidebar: () => void;
  mergeAll: () => Promise<void>;
}

interface MergeDupStepState {
  portrait: boolean;
}

class MergeDupStep extends React.Component<
  MergeDupStepProps & LocalizeContextProps,
  MergeDupStepState
> {
  constructor(props: MergeDupStepProps & LocalizeContextProps) {
    super(props);
    this.state = {
      portrait: true,
    };
  }

  next() {
    this.props.clearSidebar();
    this.props.advanceStep();
  }

  saveContinue() {
    this.props.clearSidebar();
    this.props.mergeAll().then(() => {
      this.next();
    });
  }

  render() {
    //visual definition
    return this.props.wordCount ? (
      <React.Fragment>
        {/* Merging pane */}
        <div
          style={{
            background: "#eee",
            padding: theme.spacing(1),
          }}
        >
          <GridList
            cellHeight="auto"
            style={{
              flexWrap: "nowrap",
              overflow: "auto",
            }}
          >
            <MergeDragDrop portrait={this.state.portrait} />
          </GridList>
        </div>
        {/* Merge button */}
        <Grid container justify="flex-start">
          <Grid item>
            <Button
              color="primary"
              variant="contained"
              style={{ marginRight: theme.spacing(3) }}
              onClick={() => this.saveContinue()}
              title={
                this.props.translate(
                  "mergeDups.helpText.saveAndContinue"
                ) as string
              }
            >
              {this.props.translate("buttons.saveAndContinue")}
            </Button>
            <Button
              color="secondary"
              variant="contained"
              style={{ marginRight: theme.spacing(3) }}
              onClick={() => this.next()}
              title={this.props.translate("mergeDups.helpText.skip") as string}
            >
              {this.props.translate("buttons.skip")}
            </Button>
          </Grid>
        </Grid>
      </React.Fragment>
    ) : (
      // ToDo: create component with translated text and button back to goals.
      "Nothing to merge."
    );
  }
}

export default withLocalize(MergeDupStep);
