import { Word, testWordList } from "../../../types/word";
import React from "react";
import { LocalizeContextProps, withLocalize } from "react-localize-redux";
import { Box, Grid, Button, Card, CardContent } from "@material-ui/core";
import WordList from "./WordList";
import MergeRow from "./MergeRow";

// Internal merge memory model
export interface ParentWord {
  id: number;
  senses: Sense[];
}
export interface Sense {
  id: number;
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
      <Box style={{ maxHeight: "100%" }}>
        <Grid container>
          <Grid item>
            <WordList words={testWords} />
          </Grid>
          <Grid item style={{ flex: 1 }}>
            {this.props.parentWords.map((item, _) => (
              <MergeRow parent={item} />
            ))}

            <Box
              style={{ height: "100%" }}
              onDragOver={e => e.preventDefault()}
              onDrop={_ => this.dragDrop()}
            >
              <hr />
              <Grid container direction="row-reverse">
                <Grid item />
                <Card style={{ width: 200 }}>
                  <CardContent>Drag new root word</CardContent>
                  <CardContent> Here</CardContent>
                </Card>
              </Grid>
              <Button style={{ float: "right" }} onClick={_ => this.next()}>
                Next
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Box>
    );
  }
}

//export class as default
export default withLocalize(MergeDupStep);
