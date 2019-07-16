//external modules
import * as React from "react";
import { LocalizeContextProps, withLocalize } from "react-localize-redux";
import { uuid } from "../../../../utilities";
import { MergeTreeReference, MergeTreeWord } from "../MergeDupsTree";
import { Paper, Typography } from "@material-ui/core";
import MergeStack from "../MergeStack";
import { Droppable } from "react-beautiful-dnd";
import { Hash } from "../../../../types";

//interface for component props
export interface MergeRowProps {
  draggedWord?: MergeTreeReference;
  wordID: string;
  dropWord?: () => void;
  moveSense?: (src: MergeTreeReference, dest: MergeTreeReference) => void;
  words: Hash<MergeTreeWord>;
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
  // this function is used to force this component to redraw itself when
  // the contents of parent change from the removeWord action in MergeStack
  update() {
    this.setState({});
  }

  drop() {
    if (this.props.moveSense && this.props.draggedWord && this.props.dropWord) {
      let dest = {
        word: this.props.wordID,
        sense: uuid(),
        duplicate: uuid()
      };
      this.props.moveSense(this.props.draggedWord, dest);
      this.props.dropWord();
    }
  }

  render() {
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
              <Typography variant="h5">
                {this.props.words[this.props.wordID].vern}
              </Typography>
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
