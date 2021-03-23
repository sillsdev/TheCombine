import {
  Button,
  Card,
  CardContent,
  Chip,
  Drawer,
  Grid,
  GridList,
  GridListTile,
  IconButton,
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

import {
  Hash,
  MergeTreeReference,
  MergeTreeWord,
  TreeDataSense,
} from "goals/MergeDupGoal/MergeDupStep/MergeDupsTree";
import MergeRow from "goals/MergeDupGoal/MergeDupStep/MergeRow";
import theme from "types/theme";
import { uuid } from "utilities";

export interface MergeSense {
  id: string;
  data: TreeDataSense;
}
export interface SideBar {
  senses: MergeSense[];
  wordId: string;
  mergeSenseId: string;
}

interface MergeDupStepProps {
  words: Hash<MergeTreeWord>;
  moveSenses: (src: MergeTreeReference[], dest: MergeTreeReference[]) => void;
  orderSense: (wordId: string, senseId: string, order: number) => void;
  orderDuplicate: (ref: MergeTreeReference, order: number) => void;
  mergeAll?: () => Promise<void>;
  // Will advance to the next goal step and update the words content
  advanceStep?: () => void;
}

interface MergeDupStepState {
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
      sideBar: { senses: [], wordId: "", mergeSenseId: "" },
    };
  }

  clearSideBar() {
    this.setState({ sideBar: { senses: [], wordId: "", mergeSenseId: "" } });
  }
  next() {
    this.clearSideBar();
    if (this.props.advanceStep) {
      this.props.advanceStep();
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
    const srcRefs: MergeTreeReference[] = [];

    const srcRef: MergeTreeReference = JSON.parse(res.draggableId);
    if (!srcRef.duplicateId) {
      const wordId = srcRef.wordId;
      const mergeSenseId = srcRef.mergeSenseId;
      for (const duplicateId in Object.keys(
        this.props.words[wordId].sensesGuids[mergeSenseId]
      )) {
        srcRefs.push({ wordId, mergeSenseId, duplicateId });
      }
    } else {
      srcRefs.push(srcRef);
    }

    if (res.combine) {
      const combineRef: MergeTreeReference = JSON.parse(
        res.combine.draggableId
      );
      const destRefs: MergeTreeReference[] = [];
      srcRefs.forEach(() =>
        destRefs.push({
          wordId: combineRef.wordId,
          mergeSenseId: combineRef.mergeSenseId,
          duplicateId: uuid(),
        })
      );
      this.props.moveSenses(srcRefs, destRefs);
    } else if (res.destination) {
      if (res.source.droppableId !== res.destination.droppableId) {
        // move to different word
        const destRefs = [];
        const mergeSenseId = uuid();
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        for (let _ in srcRefs) {
          destRefs.push({
            wordId: res.destination.droppableId,
            mergeSenseId,
            duplicateId: uuid(),
          });
        }
        this.props.moveSenses(srcRefs, destRefs);
        this.props.orderSense(
          res.destination.droppableId,
          mergeSenseId,
          res.destination.index
        );
      } else {
        // set ordering
        if (srcRef.duplicateId) {
          this.props.orderDuplicate(srcRef, res.destination.index);
        } else {
          this.props.orderSense(
            srcRef.wordId,
            srcRef.mergeSenseId,
            res.destination.index
          );
        }
      }
    }
  }

  senseCardContent(sense: TreeDataSense) {
    return (
      <CardContent>
        <Typography variant={"h5"}>
          {sense.glosses.map((g) => g.def).join(", ")}
        </Typography>
        <Grid container spacing={2}>
          {sense.semanticDomains.map((dom) => (
            <Grid item xs key={dom.name}>
              <Chip label={`${dom.name} ${dom.id}`} />
            </Grid>
          ))}
        </Grid>
      </CardContent>
    );
  }

  sideBarSenseDraggable(sense: MergeSense, index: number) {
    const ref: MergeTreeReference = {
      wordId: this.state.sideBar.wordId,
      mergeSenseId: this.state.sideBar.mergeSenseId,
      duplicateId: sense.id,
    };
    return (
      <Draggable key={sense.id} draggableId={JSON.stringify(ref)} index={index}>
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
              {this.senseCardContent(sense.data)}
            </Card>
          </div>
        )}
      </Draggable>
    );
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
          droppableId={`${this.state.sideBar.wordId} ${this.state.sideBar.mergeSenseId}`}
          key={this.state.sideBar.mergeSenseId}
        >
          {(providedDroppable) => (
            <div
              ref={providedDroppable.innerRef}
              {...providedDroppable.droppableProps}
              /* Add the height of the appbar (64) to the top padding. */
              style={{ padding: 30, paddingTop: 64 + 30 }}
            >
              <IconButton onClick={() => this.clearSideBar()}>
                <ArrowForwardIos />
              </IconButton>
              <Typography variant="h5">
                {this.props.words[this.state.sideBar.wordId].vern}
              </Typography>
              {this.state.sideBar.senses.map(
                (sense: MergeSense, index: number) =>
                  this.sideBarSenseDraggable(sense, index)
              )}
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
    return Object.keys(this.props.words).length ? (
      <React.Fragment>
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
                    wordId={key}
                  />
                </GridListTile>
              ))}
              <GridListTile key={newId} style={{ margin: 8 }}>
                <MergeRow
                  sideBar={this.state.sideBar}
                  setSidebar={() => {}}
                  portrait={this.state.portrait}
                  wordId={newId}
                />
              </GridListTile>
              {this.renderSideBar()}
            </DragDropContext>
          </GridList>
        </div>
        {/* Merge button */}
        <Grid container justify="flex-end">
          <Grid item>
            <Button
              color="secondary"
              variant="contained"
              style={{ marginRight: theme.spacing(3) }}
              onClick={() => this.next()}
              title={this.props.translate("mergeDups.helpText.skip") as string}
            >
              {this.props.translate("buttons.skip")}
            </Button>
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
