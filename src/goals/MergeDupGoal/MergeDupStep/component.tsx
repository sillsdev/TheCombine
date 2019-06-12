import { Word, testWordList } from "../../../types/word";
import React from "react";
import { LocalizeContextProps, withLocalize } from "react-localize-redux";
import { Box, Grid, Button, Card, CardContent } from "@material-ui/core";
import WordList from "./WordList";
import MergeRow from "./MergeRow";
import axios from "axios";

export const backend = axios.create({ baseURL: "https://localhost:5001/v1" });

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
  words: Word[];
  addParent?: (word: Word) => void;
  dropWord?: () => void;
  clearMerges?: () => void;
  addListWord?: (word: Word) => void;
  clearListWords?: () => void;
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
    this.refresh();
  }

  dragDrop() {
    if (this.props.addParent && this.props.draggedWord && this.props.dropWord) {
      this.props.addParent(this.props.draggedWord);
      this.props.dropWord();
    }
  }

  refresh() {
    if (this.props.clearListWords) {
      this.props.clearListWords();
    }
    backend.get("project/words/frontier").then(words =>
      (words.data as Word[]).map(word => {
        if (this.props.addListWord) {
          this.props.addListWord(word);
          //this.forceUpdate();
        }
      })
    );
  }

  async clear_database() {
    await backend.delete("project/words");
    this.refresh();
  }

  async fill_database() {
    await Promise.all(
      testWordList().map(async word => {
        if (this.props.addListWord) {
          await backend.post("project/words", word);
        }
      })
    );
    this.refresh();
  }

  next() {
    if (this.props.clearMerges) {
      this.props.clearMerges();
    }
  }

  render() {
    //visual definition
    return (
      <Box style={{ maxHeight: "100%" }}>
        <Grid container>
          <Grid item>
            <Button onClick={_ => this.refresh()}>Refresh</Button>
          </Grid>
          <Grid item>
            <Button onClick={_ => this.fill_database()}>Fill Database</Button>
          </Grid>
          <Grid item>
            <Button onClick={_ => this.clear_database()}>Clear Database</Button>
          </Grid>
        </Grid>
        <Grid container>
          <Grid item>
            <WordList />
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
