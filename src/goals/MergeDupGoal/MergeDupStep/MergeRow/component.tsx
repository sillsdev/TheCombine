/* THIS COMPONENT IS INTENDED TO BE AN EXAMPLE ONLY. 
  IT WILL NOT BE USED IN THE APPLICATION.
*/

//external modules
import * as React from "react";
import { LocalizeContextProps, withLocalize } from "react-localize-redux";
import { Word } from "../../../../types/word";
import { ListSubheader, Box, Grid } from "@material-ui/core";
import MergeStack from "../MergeStack";

//interface for component props
export interface MergeRowProps {
  draggedWord?: Word;
  merges: Word[];
  addWordToMerge?: (word: Word, parent: Word[]) => void;
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
    if (this.props.addWordToMerge) {
      this.props.addWordToMerge(word, this.props.merges);
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
        <ListSubheader>{this.props.merges[0].vernacular}</ListSubheader>
        <Grid container>
          {this.props.merges.map(item => (
            <Grid item>
              <MergeStack parent={item} />
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
