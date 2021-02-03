import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Drawer,
  Grid,
  GridList,
  GridListTile,
  IconButton,
  Paper,
  Typography,
} from "@material-ui/core";
import { ArrowForwardIos } from "@material-ui/icons";
import React from "react";
import {
  DragDropContext,
  Draggable,
  Droppable,
  DropResult,
} from "react-beautiful-dnd";
import { LocalizeContextProps, withLocalize } from "react-localize-redux";

import theme from "types/theme";
import { uuid } from "utilities";
import {
  MergeTreeReference,
  MergeTreeWord,
  TreeDataSense,
} from "goals/MergeDupGoal/MergeDupStep/MergeDupsTree";
import MergeRow from "goals/MergeDupGoal/MergeDupStep/MergeRow";

export interface SideBar {
  senses: { id: string; data: TreeDataSense }[];
  wordID: string;
  senseID: string;
}

//interface for component props
export interface MergeDupStepProps {
  words: { [wordID: string]: MergeTreeWord };
  moveSenses: (src: MergeTreeReference[], dest: MergeTreeReference[]) => void;
  orderSense: (wordID: string, senseID: string, order: number) => void;
  orderDuplicate: (ref: MergeTreeReference, order: number) => void;
  mergeAll?: () => Promise<void>;
  // Should update the words content in this GoalStep
  refreshWords?: () => void;
  // Will advance to the next goal step and update the words content
  advanceStep?: () => void;
}

//interface for component state
export interface MergeDupStepState {
  portrait: boolean;
  sideBar: SideBar;
}

class MergeDupStep extends React.Component<
  MergeDupStepProps & LocalizeContextProps,
  MergeDupStepState
> {
  constructor(props: MergeDupStepProps & LocalizeContextProps) {
    super(props);
    this.state = {
      portrait: true,
      sideBar: { senses: [], wordID: "WORD", senseID: "SENSE" },
    };
    if (this.props.refreshWords) {
      this.props.refreshWords();
    }
  }

  clearSideBar() {
    this.setState({ sideBar: { senses: [], wordID: "", senseID: "" } });
  }
  next() {
    this.clearSideBar();
    if (this.props.advanceStep) {
      this.props.advanceStep();
    }
    if (this.props.refreshWords) {
      this.props.refreshWords();
    }
  }
  saveContinue() {
    this.clearSideBar();
    if (this.props.mergeAll) {
      this.props.mergeAll().then(() => {
        this.next();
      });
    }
  }

  handleDrop(res: DropResult) {
    let srcRefs = [];

    let srcRef: MergeTreeReference = JSON.parse(res.draggableId);
    if (!srcRef.duplicate) {
      for (let key in this.props.words[srcRef.word].senses[srcRef.sense]) {
        srcRefs.push({
          word: srcRef.word,
          sense: srcRef.sense,
          duplicate: key,
        });
      }
    } else {
      srcRefs.push(srcRef);
    }

    if (res.combine) {
      let combineRef: MergeTreeReference = JSON.parse(res.combine.draggableId);
      // this is a combine operation
      let destRefs: MergeTreeReference[] = [];
      srcRefs.forEach(() =>
        destRefs.push({
          word: combineRef.word,
          sense: combineRef.sense,
          duplicate: uuid(),
        })
      );
      this.props.moveSenses(srcRefs, destRefs);
    } else if (res.destination) {
      if (res.source.droppableId !== res.destination.droppableId) {
        // move to different word
        let destRefs = [];
        let destSense = uuid();
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        for (let _ in srcRefs) {
          destRefs.push({
            word: res.destination.droppableId,
            sense: destSense,
            duplicate: uuid(),
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
      <Drawer
        anchor="right"
        variant="persistent"
        open={this.state.sideBar.senses.length > 1}
      >
        <Droppable
          droppableId={`${this.state.sideBar.wordID} ${this.state.sideBar.senseID}`}
          key={this.state.sideBar.senseID}
        >
          {(providedDroppable) => (
            <div
              ref={providedDroppable.innerRef}
              {...providedDroppable.droppableProps}
              /*
                  Set padding to 30 and add the height of the appbar (64) to the
                  top padding
              */
              style={{ padding: 30, paddingTop: 64 + 30 }}
            >
              <IconButton onClick={() => this.clearSideBar()}>
                <ArrowForwardIos />
              </IconButton>
              <Typography variant="h5">
                {this.props.words[this.state.sideBar.wordID].vern}
              </Typography>
              {this.state.sideBar.senses.map((entry, index) => (
                <Draggable
                  key={entry.id}
                  draggableId={JSON.stringify({
                    word: this.state.sideBar.wordID,
                    sense: this.state.sideBar.senseID,
                    duplicate: entry.id,
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
                            : index === 0
                            ? "white"
                            : "lightgrey",
                        }}
                      >
                        <CardContent>
                          <Typography variant={"h5"}>
                            {entry.data.glosses.length > 0 &&
                              entry.data.glosses
                                .map((gloss) => gloss.def)
                                .reduce((gloss, acc) => `${acc}, ${gloss}`)}
                          </Typography>
                          <Grid container spacing={2}>
                            {entry.data.semanticDomains.map((semdom) => (
                              <Grid item xs key={semdom.name}>
                                <Chip label={`${semdom.name} ${semdom.id}`} />
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
      </Drawer>
    );
  }

  render() {
    let newId = uuid();
    //visual definition
    return (
      <Box style={{ maxHeight: "100%" }}>
        {/* Merging pane */}
        <div
          style={{
            background: "#eee",
            padding: 8,
          }}
        >
          <GridList
            cellHeight="auto"
            style={{
              flexWrap: "nowrap",
              overflow: "auto",
            }}
          >
            <DragDropContext onDragEnd={(res) => this.handleDrop(res)}>
              {Object.keys(this.props.words).map((key) => (
                <GridListTile key={key} style={{ height: "70vh", margin: 8 }}>
                  <MergeRow
                    sideBar={this.state.sideBar}
                    setSidebar={(el) => this.setState({ sideBar: el })}
                    portrait={this.state.portrait}
                    wordID={key}
                  />
                </GridListTile>
              ))}
              <GridListTile key={newId} style={{ margin: 8 }}>
                <MergeRow
                  sideBar={this.state.sideBar}
                  setSidebar={() => {}}
                  portrait={this.state.portrait}
                  wordID={newId}
                />
              </GridListTile>
              {this.renderSideBar()}
            </DragDropContext>
          </GridList>
        </div>
        {/* Merge button */}
        <Paper
          square
          style={{
            position: "fixed",
            width: "100vw",
            height: "25vh",
            zIndex: theme.zIndex.drawer,
          }}
        >
          <Button
            color="primary"
            variant="contained"
            style={{ float: "right", marginRight: 30 }}
            onClick={(_) => this.saveContinue()}
            title={
              this.props.translate(
                "mergeDups.helpText.saveAndContinue"
              ) as string
            }
          >
            {this.props.translate("buttons.saveAndContinue")}
          </Button>
          <Button
            style={{ float: "right", marginRight: 30 }}
            onClick={(_) => this.next()}
            title={this.props.translate("mergeDups.helpText.skip") as string}
          >
            {this.props.translate("buttons.skip")}
          </Button>
        </Paper>
      </Box>
    );
  }
}

export default withLocalize(MergeDupStep);
