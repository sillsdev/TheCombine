//external modules
import * as React from "react";
import { LocalizeContextProps, withLocalize } from "react-localize-redux";
import { uuid } from "../../../../utilities";
import {
  MergeTreeReference,
  Hash,
  MergeTreeWord,
  MergeData
} from "../MergeDupsTree";
import { Paper, Typography, Select, MenuItem } from "@material-ui/core";
import MergeStack from "../MergeStack";
import { Droppable } from "react-beautiful-dnd";

//interface for component props
export interface MergeRowProps {
  draggedWord?: MergeTreeReference;
  setVern: (wordID: string, vern: string) => void;
  wordID: string;
  dropWord?: () => void;
  moveSense?: (src: MergeTreeReference, dest: MergeTreeReference) => void;
  words: Hash<MergeTreeWord>;
  data: MergeData;
  portait: boolean;
}

//interface for component state
interface MergeRowState {
  items: number[];
}

export class MergeRow extends React.Component<
  MergeRowProps & LocalizeContextProps,
  MergeRowState
> {
  constructor(props: MergeRowProps & LocalizeContextProps) {
    super(props);
    this.state = { items: [0, 1, 2, 3, 4] };
  }

  render() {
    let verns = [
      ...new Set(
        Object.values(this.props.words[this.props.wordID].senses)
          .map(dups =>
            Object.values(dups).map(
              senseID =>
                this.props.data.words[this.props.data.senses[senseID].srcWord]
                  .vernacular
            )
          )
          .flat()
      )
    ];
    return (
      <Droppable
        key={this.props.wordID}
        droppableId={this.props.wordID}
        isCombineEnabled={true}
      >
        {provided => (
          <Paper
            ref={provided.innerRef}
            style={{
              backgroundColor: "lightgrey",
              paddingBottom: 8
            }}
            {...provided.droppableProps}
          >
            <Paper square style={{ padding: 8 }}>
              <Select
                value={this.props.words[this.props.wordID].vern}
                onChange={e => this.props.setVern(this.props.wordID, e.target.value as string)}
              >
                {verns.map(vern => (
                  <MenuItem value={vern}>
                    <Typography variant="h5">{vern}</Typography>
                  </MenuItem>
                ))}
              </Select>
            </Paper>
            {Object.keys(this.props.words[this.props.wordID].senses).map(
              (item, index) => (
                <MergeStack
                  key={item}
                  index={index}
                  wordID={this.props.wordID}
                  senseID={item}
                  sense={this.props.words[this.props.wordID].senses[item]}
                />
              )
            )}

            {provided.placeholder}
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
