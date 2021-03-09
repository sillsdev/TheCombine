import { MenuItem, Paper, Select, Typography } from "@material-ui/core";
import * as React from "react";
import { Droppable } from "react-beautiful-dnd";

import { SideBar } from "goals/MergeDupGoal/MergeDupStep/MergeDupStepComponent";
import {
  Hash,
  MergeData,
  MergeTreeReference,
  MergeTreeWord,
} from "goals/MergeDupGoal/MergeDupStep/MergeDupsTree";
import MergeStack from "goals/MergeDupGoal/MergeDupStep/MergeRow/MergeStack";

interface MergeRowProps {
  setVern: (wordId: string, vern: string) => void;
  wordId: string;
  moveSense?: (src: MergeTreeReference, dest: MergeTreeReference) => void;
  words: Hash<MergeTreeWord>;
  data: MergeData;
  portrait: boolean;
  setSidebar: (el: SideBar) => void;
  sideBar: SideBar;
}

export default class MergeRow extends React.Component<MergeRowProps> {
  render() {
    const filled = !!this.props.words[this.props.wordId];
    let verns: string[] = [];
    if (filled) {
      verns = [
        ...new Set(
          Object.values(
            this.props.words[this.props.wordId].senses
          ).flatMap((dups) =>
            Object.values(dups).map(
              (id) =>
                this.props.data.words[this.props.data.senses[id].srcWordId]
                  .vernacular
            )
          )
        ),
      ];
    }

    // reset vern if not in vern list
    if (
      this.props.words[this.props.wordId] &&
      !verns.includes(this.props.words[this.props.wordId].vern)
    ) {
      // set vern
      this.props.setVern(this.props.wordId, verns[0] || "");
    }

    return (
      <Droppable
        key={this.props.wordId}
        droppableId={this.props.wordId}
        isCombineEnabled={true}
      >
        {(provided) => (
          <Paper
            ref={provided.innerRef}
            style={{
              backgroundColor: "lightgrey",
              paddingBottom: 8,
            }}
            {...provided.droppableProps}
          >
            <Paper square style={{ padding: 8, height: 44, minWidth: 150 }}>
              {filled && (
                <Select
                  value={this.props.words[this.props.wordId].vern}
                  onChange={(e) =>
                    this.props.setVern(
                      this.props.wordId,
                      e.target.value as string
                    )
                  }
                >
                  {verns.map((vern) => (
                    <MenuItem value={vern} key={this.props.wordId + vern}>
                      <Typography variant="h5">{vern}</Typography>
                    </MenuItem>
                  ))}
                </Select>
              )}
            </Paper>
            <div style={{ maxHeight: "55vh", overflowY: "auto" }}>
              {filled &&
                Object.keys(
                  this.props.words[this.props.wordId].senses
                ).map((item, index) => (
                  <MergeStack
                    sideBar={this.props.sideBar}
                    setSidebar={this.props.setSidebar}
                    key={item}
                    index={index}
                    wordId={this.props.wordId}
                    senseId={item}
                    sense={this.props.words[this.props.wordId].senses[item]}
                  />
                ))}
              {provided.placeholder}
            </div>
            <div style={{ padding: 16, textAlign: "center" }}>
              <Typography variant="subtitle1">
                Drag a card here to merge
              </Typography>
            </div>
          </Paper>
        )}
      </Droppable>
    );
  }
}
