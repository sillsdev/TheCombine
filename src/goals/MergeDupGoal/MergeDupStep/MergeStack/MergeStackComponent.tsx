import {
  Card,
  CardContent,
  Chip,
  Grid,
  IconButton,
  Typography,
} from "@material-ui/core";
import { ArrowForwardIos } from "@material-ui/icons";
import React from "react";
import { Draggable } from "react-beautiful-dnd";

import { SideBar } from "../MergeDupStepComponent";
import { Hash, TreeDataSense } from "../MergeDupsTree";

export interface MergeStackProps {
  wordID: string;
  senseID: string;
  sense: Hash<string>;
  senses: Hash<TreeDataSense>;
  index: number;
  setSidebar: (el: SideBar) => void;
  sideBar: SideBar;
}

interface MergeStackState {
  duplicateCount: number;
}

function arraysEqual<T>(arr1: T[], arr2: T[]) {
  if (arr1.length !== arr2.length) return false;
  for (let i = 0; i < arr1.length; i++) {
    if (arr1[i] !== arr2[i]) return false;
  }
  return true;
}

export default class MergeStack extends React.Component<
  MergeStackProps,
  MergeStackState
> {
  constructor(props: MergeStackProps) {
    super(props);
    this.state = { duplicateCount: 1 };
  }

  expand() {
    let senseEntries = Object.entries(this.props.sense).map((sense) => ({
      id: sense[0],
      data: this.props.senses[sense[1]],
    }));

    this.props.setSidebar({
      senses: senseEntries,
      wordID: this.props.wordID,
      senseID: this.props.senseID,
    });
  }

  updateDuplicateCount(duplicateCount: number) {
    if (duplicateCount > this.state.duplicateCount) {
      this.expand();
    }
    if (duplicateCount !== this.state.duplicateCount) {
      this.setState({ duplicateCount });
    }
  }

  render() {
    let senses = Object.values(this.props.sense).map(
      (senseID) => this.props.senses[senseID]
    );

    let senseEntries = Object.entries(this.props.sense).map((sense) => ({
      id: sense[0],
      data: this.props.senses[sense[1]],
    }));

    this.updateDuplicateCount(senseEntries.length);

    let glosses: { def: string; language: string; sense: string }[] = [];
    for (let entry of senseEntries) {
      for (let gloss of entry.data.glosses) {
        glosses.push({
          def: gloss.def,
          language: gloss.language,
          sense: entry.id,
        });
      }
    }
    glosses = glosses.filter(
      (v, i, a) => a.findIndex((o) => o.def === v.def) === i
    );

    let semDoms = [
      ...new Set(
        senses
          .map((sense) =>
            sense.semanticDomains.map((dom) => `${dom.name} ${dom.id}`)
          )
          .flat()
      ),
    ];

    let showMoreButton = Object.keys(this.props.sense).length > 1;

    if (
      this.props.sideBar.wordID === this.props.wordID &&
      this.props.sideBar.senseID === this.props.senseID &&
      !arraysEqual(
        this.props.sideBar.senses.map((a) => a.id),
        senseEntries.map((a) => a.id)
      )
    ) {
      this.props.setSidebar({
        senses: senseEntries,
        wordID: this.props.wordID,
        senseID: this.props.senseID,
      });
    }

    return (
      <Draggable
        key={this.props.senseID}
        draggableId={JSON.stringify({
          word: this.props.wordID,
          sense: this.props.senseID,
        })}
        index={this.props.index}
      >
        {(provided, snapshot) => (
          <Card
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            style={{
              ...provided.draggableProps.style,
              margin: 8,
              userSelect: "none",
              minWidth: 150,
              maxWidth: 300,
              background: snapshot.isDragging ? "lightgreen" : "white",
            }}
          >
            <CardContent style={{ position: "relative", paddingRight: 40 }}>
              <div
                style={{
                  position: "absolute",
                  top: "50%",
                  right: 0,
                  transform: "translateY(-50%)",
                }}
              >
                {showMoreButton && (
                  <IconButton onClick={() => this.expand()}>
                    <ArrowForwardIos />
                  </IconButton>
                )}
              </div>
              <div>
                {glosses.length > 0 && (
                  <Typography variant={"h5"}>{glosses[0].def}</Typography>
                )}
                {/* List semantic domains */}
                <Grid container spacing={2}>
                  {semDoms.map((dom) => (
                    <Grid item xs key={dom}>
                      <Chip label={dom} onDelete={() => {}} />
                    </Grid>
                  ))}
                </Grid>
              </div>
            </CardContent>
          </Card>
        )}
      </Draggable>
    );
  }
}
