import { Word, testWordList } from "../../../types/word";
import React from "react";
import {
  LocalizeContextProps,
  withLocalize,
  Translate
} from "react-localize-redux";
import { Box, Grid, Button, Card, CardContent } from "@material-ui/core";
import WordList from "./WordList";
import MergeRow from "./MergeRow";
import DupFinder from "../DuplicateFinder/DuplicateFinder";
import * as backend from "../../../backend";

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

  async refresh() {
    let Finder = new DupFinder();
    if (this.props.clearListWords) {
      this.props.clearListWords();
    }
    let temp = await Finder.getNextDups();
    temp.map(word => {
      if (this.props.addListWord) {
        this.props.addListWord(word);
      }
    });
  }

  async clear_database() {
    // await backend.delete("projects/words");
    this.refresh();
  }

  async fill_database() {
    await Promise.all(
      testWordList().map(async word => {
        if (this.props.addListWord) {
          word.id = "";
          await backend.createWord(word);
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
          {/* <Grid item>
            <Button onClick={_ => this.fill_database()}>Fill Database</Button>
          </Grid> */}
          {/* <Grid item>
            <Button onClick={_ => this.clear_database()}>Clear Database</Button>
          </Grid> */}
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
              <Grid container>
                <Grid item />
                {this.props.draggedWord && (
                  <Card style={{ width: 200, backgroundColor: "#eee" }}>
                    <CardContent>Drag new root word Here</CardContent>
                  </Card>
                )}
              </Grid>
              <Button
                variant="contained"
                color="primary"
                style={{ float: "right", margin: 10 }}
                onClick={_ => this.next()}
              >
                <Translate id="goal.mergeDups.done" />
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
