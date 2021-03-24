import { MenuItem, Paper, Select, Typography } from "@material-ui/core";
import * as React from "react";
import { Droppable } from "react-beautiful-dnd";

import { SideBar } from "goals/MergeDupGoal/MergeDupStep/MergeDupStepComponent";
import { MergeTreeState } from "goals/MergeDupGoal/MergeDupStep/MergeDupStepReducer";
import MergeStack from "goals/MergeDupGoal/MergeDupStep/MergeRow/MergeStack";

interface MergeRowProps {
  setVern: (wordId: string, vern: string) => void;
  wordId: string;
  treeState: MergeTreeState;
  portrait: boolean;
  setSidebar: (el: SideBar) => void;
  sideBar: SideBar;
}

export default class MergeRow extends React.Component<MergeRowProps> {
  render() {
    const treeWords = this.props.treeState.tree.words;
    const data = this.props.treeState.data;
    const filled = !!treeWords[this.props.wordId];
    let verns: string[] = [];
    if (filled) {
      verns.push(
        ...new Set(
          Object.values(
            treeWords[this.props.wordId].sensesGuids
          ).flatMap((senseGuids) =>
            Object.values(senseGuids).map(
              (g) => data.words[data.senses[g].srcWordId].vernacular
            )
          )
        )
      );
    }

    // reset vern if not in vern list
    if (
      treeWords[this.props.wordId] &&
      !verns.includes(treeWords[this.props.wordId].vern)
    ) {
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
                  value={treeWords[this.props.wordId].vern}
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
                  treeWords[this.props.wordId].sensesGuids
                ).map((id, index) => (
                  <MergeStack
                    sideBar={this.props.sideBar}
                    setSidebar={this.props.setSidebar}
                    key={id}
                    index={index}
                    wordId={this.props.wordId}
                    mergeSenseId={id}
                    guids={treeWords[this.props.wordId].sensesGuids[id]}
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
