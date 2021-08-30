import { Button, Grid, ImageList, Typography } from "@material-ui/core";
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
          <ImageList
            rowHeight="auto"
            style={{
              flexWrap: "nowrap",
              overflow: "auto",
            }}
          >
            <MergeDragDrop portrait={this.state.portrait} />
          </ImageList>
        </div>
        {/* Merge button */}
        <Grid container justifyContent="flex-start">
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
              id="merge-save"
            >
              {this.props.translate("buttons.saveAndContinue")}
            </Button>
            <Button
              color="secondary"
              variant="contained"
              style={{ marginRight: theme.spacing(3) }}
              onClick={() => this.next()}
              title={this.props.translate("mergeDups.helpText.skip") as string}
              id="merge-skip"
            >
              {this.props.translate("buttons.skip")}
            </Button>
          </Grid>
        </Grid>
      </React.Fragment>
    ) : (
      // ToDo: create component with translated text and button back to goals.
      <Typography>
        {this.props.translate("mergeDups.helpText.noDups")}
      </Typography>
    );
  }
}

export default withLocalize(MergeDupStep);
