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
  MergeTreeSense,
  MergeTreeWord,
  SideBar,
} from "goals/MergeDupGoal/MergeDupStep/MergeDupsTree";
import MergeRow from "goals/MergeDupGoal/MergeDupStep/MergeRow";
import theme from "types/theme";
import { uuid } from "utilities";

interface MergeDupStepProps {
  sideBar: SideBar;
  words: Hash<MergeTreeWord>;
  moveSenses: (src: MergeTreeReference[], dest: MergeTreeReference[]) => void;
  orderSense: (ref: MergeTreeReference) => void;
  orderDuplicate: (ref: MergeTreeReference, index: number) => void;
  mergeAll: () => Promise<void>;
  // Will advance to the next goal step and update the words content
  advanceStep: () => void;
  setSideBar: (sideBar?: SideBar) => void;
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
    this.props.setSideBar();
    this.props.advanceStep();
  }

  saveContinue() {
    this.props.setSideBar();
    this.props.mergeAll().then(() => {
      this.next();
    });
  }

  handleDrop(res: DropResult) {
    const srcRefs: MergeTreeReference[] = [];

    const srcRef: MergeTreeReference = JSON.parse(res.draggableId);
    if (srcRef.index === undefined) {
      const wordId = srcRef.wordId;
      const mergeSenseId = srcRef.mergeSenseId;
      this.props.words[wordId].sensesGuids[
        mergeSenseId
      ].forEach((_guid, index) =>
        srcRefs.push({ wordId, mergeSenseId, index })
      );
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
          index: -1,
        })
      );
      this.props.moveSenses(srcRefs, destRefs);
    } else if (res.destination) {
      if (res.source.droppableId !== res.destination.droppableId) {
        // move to different word
        const destRefs: MergeTreeReference[] = [];
        const mergeSenseId = uuid();
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        for (let _ in srcRefs) {
          destRefs.push({
            wordId: res.destination.droppableId,
            mergeSenseId,
            index: -1,
          });
        }
        this.props.moveSenses(srcRefs, destRefs);
        const ref: MergeTreeReference = {
          wordId: res.destination.droppableId,
          mergeSenseId,
          index: res.destination.index,
        };
        this.props.orderSense(ref);
      } else {
        // set ordering
        if (srcRef.index !== undefined) {
          this.props.orderDuplicate(srcRef, res.destination.index);
        } else {
          const ref: MergeTreeReference = {
            ...srcRef,
            index: res.destination.index,
          };
          this.props.orderSense(ref);
        }
      }
    }
  }

  senseCardContent(sense: MergeTreeSense) {
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

  sideBarSenseDraggable(sense: MergeTreeSense, index: number) {
    const ref: MergeTreeReference = {
      wordId: this.props.sideBar.wordId,
      mergeSenseId: this.props.sideBar.mergeSenseId,
      index,
    };
    return (
      <Draggable
        key={sense.guid}
        draggableId={JSON.stringify(ref)}
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
              {this.senseCardContent(sense)}
            </Card>
          </div>
        )}
      </Draggable>
    );
  }

  renderSideBar() {
    if (this.props.sideBar.senses.length <= 1) return <div />;
    return (
      <Drawer
        anchor="right"
        variant="persistent"
        open={this.props.sideBar.senses.length > 1}
      >
        <Droppable
          droppableId={`${this.props.sideBar.wordId} ${this.props.sideBar.mergeSenseId}`}
          key={this.props.sideBar.mergeSenseId}
        >
          {(providedDroppable) => (
            <div
              ref={providedDroppable.innerRef}
              {...providedDroppable.droppableProps}
              /* Add the height of the appbar (64) to the top padding. */
              style={{ padding: 30, paddingTop: 64 + 30 }}
            >
              <IconButton onClick={() => this.props.setSideBar()}>
                <ArrowForwardIos />
              </IconButton>
              <Typography variant="h5">
                {this.props.words[this.props.sideBar.wordId].vern}
              </Typography>
              {this.props.sideBar.senses.map(
                (sense: MergeTreeSense, index: number) =>
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
    const newId = uuid();
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
                  <MergeRow portrait={this.state.portrait} wordId={key} />
                </GridListTile>
              ))}
              <GridListTile key={newId} style={{ margin: 8 }}>
                <MergeRow portrait={this.state.portrait} wordId={newId} />
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
