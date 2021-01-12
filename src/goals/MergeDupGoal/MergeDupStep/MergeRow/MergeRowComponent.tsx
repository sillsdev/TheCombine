import { MenuItem, Paper, Select, Typography } from "@material-ui/core";
import * as React from "react";
import { Droppable } from "react-beautiful-dnd";
import { LocalizeContextProps, withLocalize } from "react-localize-redux";

import { SideBar } from "../MergeDupStepComponent";
import {
  Hash,
  MergeData,
  MergeTreeReference,
  MergeTreeWord,
} from "../MergeDupsTree";
import MergeStack from "./MergeStack";

//interface for component props
export interface MergeRowProps {
  setVern: (wordID: string, vern: string) => void;
  wordID: string;
  moveSense?: (src: MergeTreeReference, dest: MergeTreeReference) => void;
  words: Hash<MergeTreeWord>;
  data: MergeData;
  portrait: boolean;
  setSidebar: (el: SideBar) => void;
  sideBar: SideBar;
}

export class MergeRow extends React.Component<
  MergeRowProps & LocalizeContextProps
> {
  render() {
    let filled = !!this.props.words[this.props.wordID];
    let verns: string[] = [];
    if (filled) {
      verns = [
        ...new Set(
          Object.values(this.props.words[this.props.wordID].senses)
            .map((dups) =>
              Object.values(dups).map(
                (senseID) =>
                  this.props.data.words[this.props.data.senses[senseID].srcWord]
                    .vernacular
              )
            )
            .flat()
        ),
      ];
    }

    // reset vern if not in vern list
    if (
      this.props.words[this.props.wordID] &&
      !verns.includes(this.props.words[this.props.wordID].vern)
    ) {
      // set vern
      this.props.setVern(this.props.wordID, verns[0] || "");
    }

    return (
      <Droppable
        key={this.props.wordID}
        droppableId={this.props.wordID}
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
                  value={this.props.words[this.props.wordID].vern}
                  onChange={(e) =>
                    this.props.setVern(
                      this.props.wordID,
                      e.target.value as string
                    )
                  }
                >
                  {verns.map((vern) => (
                    <MenuItem value={vern} key={this.props.wordID + vern}>
                      <Typography variant="h5">{vern}</Typography>
                    </MenuItem>
                  ))}
                </Select>
              )}
            </Paper>
            <div style={{ maxHeight: "55vh", overflowY: "auto" }}>
              {filled &&
                Object.keys(
                  this.props.words[this.props.wordID].senses
                ).map((item, index) => (
                  <MergeStack
                    sideBar={this.props.sideBar}
                    setSidebar={this.props.setSidebar}
                    key={item}
                    index={index}
                    wordID={this.props.wordID}
                    senseID={item}
                    sense={this.props.words[this.props.wordID].senses[item]}
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

//export class as default
export default withLocalize(MergeRow);
