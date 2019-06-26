import { Word, testWordList } from "../../../types/word";
import React from "react";
import {
  LocalizeContextProps,
  withLocalize,
  Translate
} from "react-localize-redux";
import {
  Box,
  Grid,
  Button,
  Card,
  CardContent,
  GridList,
  GridListTile
} from "@material-ui/core";
import WordList from "./WordList";
import MergeRow from "./MergeRow";
import * as backend from "../../../backend";

// Constants
const MIN_VIEW: string = "60vh";
const MAX_VIEW: string = "75vh";
const HEIGHT_STYLE: React.CSSProperties = {
  //minHeight: MIN_VIEW,
  height: MAX_VIEW
};

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
  applyMerges?: () => void;
  addListWord?: (word: Word[]) => void;
  clearListWords?: () => void;
  refreshListWords?: () => void;
  draggedWord?: Word;
}

//interface for component state
export interface MergeDupStepState {}

class MergeDupStep extends React.Component<
  MergeDupStepProps & LocalizeContextProps,
  MergeDupStepState
> {
  componentDidMount() {
    if (this.props.refreshListWords) {
      this.props.refreshListWords();
    }
  }

  dragDrop() {
    if (this.props.addParent && this.props.draggedWord && this.props.dropWord) {
      this.props.addParent(this.props.draggedWord);
      this.props.dropWord();
    }
  }

  async clear_database() {
    // await backend.delete("projects/words");
    if (this.props.refreshListWords) {
      this.props.refreshListWords();
    }
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
    if (this.props.refreshListWords) {
      this.props.refreshListWords();
    }
  }

  next() {
    if (this.props.applyMerges) this.props.applyMerges();
  }

  render() {
    //visual definition
    return (
      <Box style={{ maxHeight: "100%" }}>
        <Grid container>
          {/* <Grid item>
            <Button onClick={_ => this.fill_database()}>Fill Database</Button>
          </Grid> */}
          {/* <Grid item>
            <Button onClick={_ => this.clear_database()}>Clear Database</Button>
          </Grid> */}
        </Grid>
        <GridList cols={5}>
          {/* WordList */}
          <GridListTile
            cols={1}
            style={{
              ...HEIGHT_STYLE,
              minWidth: "15vw",
              maxWidth: "20vw"
            }}
          >
            <div style={{ ...HEIGHT_STYLE, overflowY: "scroll" }}>
              <WordList />
            </div>
          </GridListTile>

          {/* Merging pane */}
          <GridListTile
            cols={4}
            style={{ ...HEIGHT_STYLE, minWidth: "65vw", maxWidth: "75vw" }}
          >
            <div style={{ ...HEIGHT_STYLE, overflowY: "scroll" }}>
              <Grid item style={{ flex: 1 }}>
                {this.props.parentWords.map((item, _) => (
                  <MergeRow parent={item} />
                ))}

                <Box
                  style={{ height: "100%" }}
                  onDragOver={e => e.preventDefault()}
                  onDrop={_ => this.dragDrop()}
                  title={
                    this.props.translate("mergeDups.helpText.root") as string
                  }
                >
                  <hr />
                  <Grid container>
                    <Grid item />
                    {
                      <Card style={{ width: 200, backgroundColor: "#eee" }}>
                        <CardContent>Drag new root word Here</CardContent>
                      </Card>
                    }
                  </Grid>
                </Box>
              </Grid>
            </div>
          </GridListTile>

          {/* Merge button */}
          <GridListTile cols={5} style={{ borderTop: "1px solid gray" }}>
            <Button
              variant="contained"
              color="primary"
              style={{ float: "right", margin: 10 }}
              onClick={_ => this.next()}
              title={this.props.translate("mergeDups.helpText.next") as string}
            >
              <Translate id="goal.mergeDups.done" />
            </Button>
          </GridListTile>
        </GridList>
      </Box>
    );
  }
}

//export class as default
export default withLocalize(MergeDupStep);
