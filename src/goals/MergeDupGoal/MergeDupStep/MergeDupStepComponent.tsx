import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Switch
} from "@material-ui/core";
import React from "react";
import {
  LocalizeContextProps,
  Translate,
  withLocalize
} from "react-localize-redux";
import { styleAddendum } from "../../../types/theme";
import { uuid } from "../../../utilities";
import { MergeTreeReference, MergeTreeWord } from "./MergeDupsTree";
import MergeRow from "./MergeRow";
import { DragDropContext } from "react-beautiful-dnd";

// Constants
const MIN_VIEW: string = "60vh";
const MAX_VIEW: string = "75vh";
const HEIGHT_STYLE: React.CSSProperties = {
  //minHeight: MIN_VIEW,
  height: MAX_VIEW
};

//interface for component props
export interface MergeDupStepProps {
  words: { [wordID: string]: MergeTreeWord };
  dropWord?: () => void;
  draggedSense?: MergeTreeReference;
  moveSense?: (src: MergeTreeReference, dest: MergeTreeReference) => void;
  mergeAll?: () => void;
  refreshWords?: () => void;
}

//interface for component state
export interface MergeDupStepState {
  portrait: boolean;
}

class MergeDupStep extends React.Component<
  MergeDupStepProps & LocalizeContextProps,
  MergeDupStepState
> {
  constructor(props: MergeDupStepProps & LocalizeContextProps) {
    super(props);
    this.state = { portrait: true };
  }
  componentDidMount() {
    if (this.props.refreshWords) {
      this.props.refreshWords();
    }
  }

  dragDrop() {
    if (
      this.props.moveSense &&
      this.props.draggedSense &&
      this.props.dropWord
    ) {
      let ref = {
        word: uuid(),
        sense: uuid(),
        duplicate: uuid()
      };
      this.props.moveSense(this.props.draggedSense, ref);
      this.props.dropWord();
    }
  }

  next() {
    if (this.props.mergeAll) this.props.mergeAll();
  }

  render() {
    //visual definition
    return (
      <Box style={{ maxHeight: "100%" }}>
        Portrait
        <Switch
          checked={this.state.portrait}
          onChange={e => this.setState({ portrait: e.target.checked })}
        />
        {/* Merging pane */}
        <div style={{ ...HEIGHT_STYLE, overflowY: "scroll" }}>
          <Grid
            container
            direction={this.state.portrait ? "row" : "column"}
            style={{ flex: 1 }}
          >
            <DragDropContext onDragEnd={() => {}}>
              {Object.keys(this.props.words).map(key => (
                <Grid item>
                  <MergeRow portait={this.state.portrait} wordID={key} />
                </Grid>
              ))}
              {
                <Box
                  style={{ height: "100%" }}
                  onDragOver={e => e.preventDefault()}
                  onDrop={_ => this.dragDrop()}
                  title={
                    this.props.translate("mergeDups.helpText.root") as string
                  }
                >
                  <hr />
                  <Grid container>
                    <Grid item />
                    {
                      <Card style={{ ...styleAddendum.inactive, width: 200 }}>
                        <CardContent>Drag new root word Here</CardContent>
                      </Card>
                    }
                  </Grid>
                </Box>
              }
            </DragDropContext>
          </Grid>
        </div>
        {/* Merge button */}
        <div style={{ borderTop: "1px solid gray" }}>
          <Button
            style={{ float: "right", margin: 10 }}
            onClick={_ => this.next()}
            title={this.props.translate("mergeDups.helpText.next") as string}
          >
            <Translate id="goal.mergeDups.done" />
          </Button>
        </div>
      </Box>
    );
  }
}

//export class as default
export default withLocalize(MergeDupStep);
