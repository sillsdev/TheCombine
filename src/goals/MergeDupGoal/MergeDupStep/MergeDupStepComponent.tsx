import { Button, Grid, ImageList, Typography } from "@material-ui/core";
import React, { ReactElement } from "react";
import { WithTranslation, withTranslation } from "react-i18next";

import MergeDragDrop from "goals/MergeDupGoal/MergeDupStep/DragDropComponents/MergeDragDrop";
import theme from "types/theme";

interface MergeDupStepProps {
  wordCount: number;
  advanceStep: () => void;
  clearSidebar: () => void;
  mergeAll: () => Promise<void>;
}

class MergeDupStep extends React.Component<
  MergeDupStepProps & WithTranslation
> {
  next(): void {
    this.props.clearSidebar();
    this.props.advanceStep();
  }

  saveContinue(): void {
    this.props.clearSidebar();
    this.props.mergeAll().then(() => this.next());
  }

  render(): ReactElement {
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
            style={{ flexWrap: "nowrap", overflow: "auto" }}
          >
            <MergeDragDrop />
          </ImageList>
        </div>
        {/* Merge/skip buttons */}
        <Grid container justifyContent="flex-start">
          <Grid item>
            <Button
              color="primary"
              variant="contained"
              style={{ marginRight: theme.spacing(3) }}
              onClick={() => this.saveContinue()}
              title={this.props.t("mergeDups.helpText.saveAndContinue")}
              id="merge-save"
            >
              {this.props.t("buttons.saveAndContinue")}
            </Button>
            <Button
              color="secondary"
              variant="contained"
              style={{ marginRight: theme.spacing(3) }}
              onClick={() => this.next()}
              title={this.props.t("mergeDups.helpText.skip")}
              id="merge-skip"
            >
              {this.props.t("buttons.skip")}
            </Button>
          </Grid>
        </Grid>
      </React.Fragment>
    ) : (
      // TODO: create component with button back to goals.
      <Typography>{this.props.t("mergeDups.helpText.noDups")}</Typography>
    );
  }
}

export default withTranslation()(MergeDupStep);
