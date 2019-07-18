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
  IconButton,
  Typography,
  Chip
} from "@material-ui/core";
import React from "react";
import {
  LocalizeContextProps,
  Translate,
  withLocalize
} from "react-localize-redux";
import { styleAddendum } from "../../../types/theme";
import { uuid } from "../../../utilities";
import {
  TreeDataSense,
  MergeTreeReference,
  MergeTreeWord
} from "./MergeDupsTree";
import MergeRow from "./MergeRow";
import {
  Droppable,
  Draggable,
  DragDropContext,
  DropResult
} from "react-beautiful-dnd";
import { ArrowBackIos, ArrowForwardIos } from "@material-ui/icons";

// Constants
const MIN_VIEW: string = "60vh";
const MAX_VIEW: string = "75vh";
const HEIGHT_STYLE: React.CSSProperties = {
  //minHeight: MIN_VIEW,
  height: MAX_VIEW
};

export interface SideBar {
  senses: { id: string; data: TreeDataSense }[];
  wordID: string;
  senseID: string;
}

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
  sideBar: SideBar;
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
      sideBar: { senses: [], wordID: "WORD", senseID: "SENSE" }
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

  renderSideBar() {
    if (this.state.sideBar.senses.length <= 1) return <div />;
    return (
      <Paper
        square
        style={{
          float: "right",
          position: "relative",
          padding: 40,
          height: "100%",
          top: -8,
          right: -8
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
            this.setState({
              ...this.state,
              sideBar: { senseID: "", wordID: "", senses: [] }
            })
          }
        >
          <ArrowForwardIos />
        </IconButton>
        <Droppable
          droppableId={`${this.state.sideBar.wordID} ${this.state.sideBar.senseID}`}
        >
          {(providedDroppable) => (
            <div
              ref={providedDroppable.innerRef}
              {...providedDroppable.droppableProps}
              style={{
                width: 250
              }}
            >
              <Typography variant="h5">
                {this.props.words[this.state.sideBar.wordID].vern}
              </Typography>
              {this.state.sideBar.senses.map((entry, index) => (
                <Draggable
                  draggableId={JSON.stringify({
                    word: this.state.sideBar.wordID,
                    sense: this.state.sideBar.senseID,
                    duplicate: entry.id
                  })}
                  index={index}
                >
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                    >
                      <Card
                        style={{
                          marginBottom: 8,
                          marginTop: 8,
                          background: snapshot.isDragging
                            ? "lightgreen"
                            : "white"
                        }}
                      >
                        <CardContent>
                          <Typography variant={"h5"}>
                            {entry.data.glosses
                              .map(gloss => gloss.def)
                              .reduce((gloss, acc) => `${acc}, ${gloss}`)}
                          </Typography>
                          <Grid container spacing={2}>
                            {entry.data.semanticDomains.map(semdom => (
                              <Grid item xs>
                                <Chip
                                  label={`${semdom.name} ${semdom.id}`}
                                />
                              </Grid>
                            ))}
                          </Grid>
                        </CardContent>
                      </Card>
                    </div>
                  )}
                </Draggable>
              ))}
              {providedDroppable.placeholder}
            </div>
          )}
        </Droppable>
      </Paper>
    );
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
          {/* Merging pane */}
          <div
            style={{
              ...HEIGHT_STYLE,
              overflow: "hidden",
              background: "#eee",
              padding: 8
            }}
          >
            {this.renderSideBar()}
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
                    sideBar={this.state.sideBar}
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
                  sideBar={this.state.sideBar}
                  setSidebar={_ => {}}
                  portrait={this.state.portrait}
                  wordID={newId}
                />
              </GridListTile>
            </GridList>
          </div>
        </DragDropContext>
        {/* Merge button */}
        <div style={{ borderTop: "1px solid gray", margin: 10 }}>
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
