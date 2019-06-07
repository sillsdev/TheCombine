import { Word, Merge, testWordList } from "../../../types/word";
import React from "react";
import { LocalizeContextProps, withLocalize } from "react-localize-redux";
import { Box, Grid, Button } from "@material-ui/core";
import WordList from "./WordList";
import MergeRow from "./MergeRow";

// Internal merge memory model
export interface ParentWord {
  word: Word;
  senses: Sense[];
}
export interface Sense {
  parent: Word;
  dups: Word[];
}

//interface for component props
export interface MergeDupStepProps {
  parentWords: ParentWord[];
  addParent?: (word: Word) => void;
  dropWord?: () => void;
  clearMerges?: () => void;
  draggedWord?: Word;
}

//interface for component state
export interface MergeDupStepState {}

//interface for component state
interface WordListState {}

class MergeDupStep extends React.Component<
  MergeDupStepProps & LocalizeContextProps,
  MergeDupStepState
> {
  constructor(props: MergeDupStepProps & LocalizeContextProps) {
    super(props);
  }

  dragDrop() {
    if (this.props.addParent && this.props.draggedWord && this.props.dropWord) {
      this.props.addParent(this.props.draggedWord);
      this.props.dropWord();
    }
  }

  next() {
    if (this.props.clearMerges) {
      this.props.clearMerges();
    }
  }

  render() {
    var testWords: Word[] = testWordList();
    //visual definition
    return (
      //we really shouldn't be manually changing colors but you can't see pure white
      // cards on a pure white background so I am **temporarily** changing the bg here
      <Box bgcolor="#eee">
        <Grid container>
          <Grid item>
            <WordList words={testWords} />
          </Grid>
          <Grid item style={{ flex: 1 }}>
            {this.props.parentWords.map((item, _) => (
              <MergeRow parent={item} />
            ))}
            <Button style={{ float: "right" }} onClick={_ => this.next()}>
              Next
            </Button>
            <Box
              style={{ height: "100%" }}
              onDragOver={e => e.preventDefault()}
              onDrop={_ => this.dragDrop()}
            />
          </Grid>
        </Grid>
      </Box>
    );
  }
}

//export class as default
export default withLocalize(MergeDupStep);
