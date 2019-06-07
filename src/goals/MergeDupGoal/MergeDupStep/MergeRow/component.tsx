//external modules
import * as React from "react";
import { LocalizeContextProps, withLocalize } from "react-localize-redux";
import { Word } from "../../../../types/word";
import { ListSubheader, Box, Grid, Container } from "@material-ui/core";
import MergeStack from "../MergeStack";
import { Sense, ParentWord } from "../component";

//interface for component props
export interface MergeRowProps {
  draggedWord?: Word;
  parent: ParentWord;
  addSense?: (word: Word, parent: Word) => void;
  dropWord?: () => void;
}

//interface for component state
interface MergeRowState {}

export class MergeRow extends React.Component<
  MergeRowProps & LocalizeContextProps,
  MergeRowState
> {
  constructor(props: MergeRowProps & LocalizeContextProps) {
    super(props);
  }

  add_sense(word: Word) {
    if (this.props.addSense) {
      this.props.addSense(word, this.props.parent.word);
    }
  }

  drop() {
    if (this.props.draggedWord && this.props.dropWord) {
      this.add_sense(this.props.draggedWord);
      this.props.dropWord();
    }
  }

  render() {
    //visual definition
    return (
      <Box style={{ flex: 1 }}>
        <ListSubheader>
          <div style={{ textAlign: "center" }}>
            {this.props.parent.word.vernacular}
          </div>
          <hr />
        </ListSubheader>
        <Grid container direction="row-reverse">
          {this.props.parent.senses.map(item => (
            <Grid item>
              <MergeStack sense={item} />
            </Grid>
          ))}
          <Grid
            item
            style={{ flex: 1 }}
            onDragOver={e => e.preventDefault()}
            onDrop={_ => this.drop()}
          />
        </Grid>
      </Box>
    );
  }
}

//export class as default
export default withLocalize(MergeRow);
