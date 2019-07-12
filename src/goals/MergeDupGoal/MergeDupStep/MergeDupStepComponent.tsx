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
import { DragDropContext, DropResult } from "react-beautiful-dnd";

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
  moveSenses: (src: MergeTreeReference[], dest: MergeTreeReference[]) => void;
  orderSense: (wordID: string, senseID: string, order: number) => void;
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

  dragDrop() {}

  next() {
    if (this.props.mergeAll) this.props.mergeAll();
  }

  foo(res: DropResult) {
    console.log(res);
    let srcRefs = [];
    for (let key in this.props.words[res.source.droppableId].senses[
      res.draggableId
    ]) {
      srcRefs.push({
        word: res.source.droppableId,
        sense: res.draggableId,
        duplicate: key
      });
    }

    if (res.combine) {
      // this is a combine operation
      let destRefs = [];
      for (let _ in srcRefs) {
        destRefs.push({
          word: res.combine.droppableId,
          sense: res.combine.draggableId,
          duplicate: uuid()
        });
      }
      this.props.moveSenses(srcRefs, destRefs);
    } else if (res.destination) {
      if (res.source.droppableId !== res.destination.droppableId) {
        // move to different word
        let destRefs = [];
        for (let _ in srcRefs) {
          destRefs.push({
            word: res.destination.droppableId,
            sense: res.draggableId,
            duplicate: uuid()
          });
        }
        this.props.moveSenses(srcRefs, destRefs);
        this.props.orderSense(
          res.destination.droppableId,
          res.draggableId,
          res.destination.index
        );
      } else {
        // set ordering
        this.props.orderSense(
          res.source.droppableId,
          res.draggableId,
          res.destination.index
        );
      }
    }
  }

  render() {
    let key = Object.keys(this.props.words).reduce(
      (key, acc) => `${key}:${acc}`,
      "Step:"
    );
    //visual definition
    return (
      <Box style={{ maxHeight: "100%" }}>
        Portrait
        <Switch
          checked={this.state.portrait}
          onChange={e => this.setState({ portrait: e.target.checked })}
        />
        {/* Merging pane */}
        <div
          style={{
            ...HEIGHT_STYLE,
            overflowY: "scroll",
            background: "white",
            padding: 8
          }}
        >
          <Grid
            container
            direction={this.state.portrait ? "row" : "column"}
            style={{ flex: 1 }}
            spacing={2}
          >
            <DragDropContext onDragEnd={res => this.foo(res)}>
              {Object.keys(this.props.words).map(key => (
                <Grid item key={key}>
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
