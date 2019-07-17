import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Switch,
  List,
  ListItem,
  GridList,
  GridListTile,
  Paper,
  IconButton
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
import { ArrowBackIos, ArrowForwardIos } from "@material-ui/icons";

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
  orderDuplicate: (ref: MergeTreeReference, order: number) => void;
  mergeAll?: () => void;
  refreshWords?: () => void;
}

//interface for component state
export interface MergeDupStepState {
  portrait: boolean;
  sideBar: () => JSX.Element | undefined;
  colCount: number;
}

class MergeDupStep extends React.Component<
  MergeDupStepProps & LocalizeContextProps,
  MergeDupStepState
> {
  constructor(props: MergeDupStepProps & LocalizeContextProps) {
    super(props);
    this.state = {
      colCount: 2,
      portrait: true,
      sideBar: () => undefined
    };
  }
  componentDidMount() {
    this.updateWindowDimensions();
    if (this.props.refreshWords) {
      this.props.refreshWords();
    }
    window.addEventListener("resize", () => this.updateWindowDimensions());
  }

  componentDidUnmount() {
    window.removeEventListener("resize", () => this.updateWindowDimensions());
  }

  componentWillMount() {
    document.body.style.overflow = "hidden";
  }

  updateWindowDimensions() {
    console.log(window);
    this.setState({ ...this.state, colCount: window.innerWidth / 250 });
  }

  next() {
    if (this.props.mergeAll) this.props.mergeAll();
  }

  handleDrop(res: DropResult) {
    let srcRefs = [];

    let srcRef: MergeTreeReference = JSON.parse(res.draggableId);
    if (!srcRef.duplicate) {
      for (let key in this.props.words[srcRef.word].senses[srcRef.sense]) {
        srcRefs.push({
          word: srcRef.word,
          sense: srcRef.sense,
          duplicate: key
        });
      }
    } else {
      srcRefs.push(srcRef);
    }

    if (res.combine) {
      let combineRef: MergeTreeReference = JSON.parse(res.combine.draggableId);
      // this is a combine operation
      let destRefs = [];
      for (let _ in srcRefs) {
        destRefs.push({
          word: combineRef.word,
          sense: combineRef.sense,
          duplicate: uuid()
        });
      }
      this.props.moveSenses(srcRefs, destRefs);
    } else if (res.destination) {
      if (res.source.droppableId !== res.destination.droppableId) {
        // move to different word
        let destRefs = [];
        let destSense = uuid();
        for (let _ in srcRefs) {
          destRefs.push({
            word: res.destination.droppableId,
            sense: destSense,
            duplicate: uuid()
          });
        }
        this.props.moveSenses(srcRefs, destRefs);
        this.props.orderSense(
          res.destination.droppableId,
          destSense,
          res.destination.index
        );
      } else {
        // set ordering
        if (srcRef.duplicate) {
          this.props.orderDuplicate(srcRef, res.destination.index);
        } else {
          this.props.orderSense(
            srcRef.word,
            srcRef.sense,
            res.destination.index
          );
        }
      }
    }
  }

  render() {
    let key = Object.keys(this.props.words).reduce(
      (key, acc) => `${key}:${acc}`,
      "Step:"
    );

    let newId = uuid();
    //visual definition
    return (
      <Box style={{ maxHeight: "100%" }}>
        <DragDropContext onDragEnd={res => this.handleDrop(res)}>
          {this.state.sideBar() && (
            <Paper
              square
              style={{
                float: "right",
                position: "relative",
                padding: 40
              }}
            >
              <IconButton
                style={{
                  position: "absolute",
                  top: "50%",
                  left: 0,
                  transform: "translateY(-50%)"
                }}
                onClick={() =>
                  this.setState({ ...this.state, sideBar: () => undefined })
                }
              >
                <ArrowForwardIos />
              </IconButton>
              {this.state.sideBar()}
            </Paper>
          )}
          {/* Merging pane */}
          <div
            style={{
              ...HEIGHT_STYLE,
              overflow: "hidden",
              background: "#eee",
              padding: 8
            }}
          >
            <GridList
              cellHeight="auto"
              cols={this.state.colCount}
              style={{
                flexWrap: "nowrap"
              }}
            >
              {Object.keys(this.props.words).map(key => (
                <GridListTile key={key} style={{ margin: 8 }}>
                  <MergeRow
                    setSidebar={el =>
                      this.setState({ ...this.state, sideBar: el })
                    }
                    portrait={this.state.portrait}
                    wordID={key}
                  />
                </GridListTile>
              ))}
              <GridListTile key={newId} style={{ margin: 8 }}>
                <MergeRow
                  setSidebar={_ => {}}
                  portrait={this.state.portrait}
                  wordID={newId}
                />
              </GridListTile>
            </GridList>
          </div>
        </DragDropContext>
        {/* Merge button */}
        <div style={{ borderTop: "1px solid gray" }}>
          <Button
            style={{ float: "right" }}
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
