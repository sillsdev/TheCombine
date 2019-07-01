import {Box, Button, Card, CardContent, Grid, GridList, GridListTile} from "@material-ui/core";
import React from "react";
import {LocalizeContextProps, Translate, withLocalize} from "react-localize-redux";
import {styleAddendum} from "../../../types/theme";
import {uuid} from "../../../utilities";
import {MergeTreeWord, MergeTreeReference} from './MergeDupsTree';
import MergeRow from './MergeRow';

// Constants
const MIN_VIEW: string = "60vh";
const MAX_VIEW: string = "75vh";
const HEIGHT_STYLE: React.CSSProperties = {
  //minHeight: MIN_VIEW,
  height: MAX_VIEW
};

//interface for component props
export interface MergeDupStepProps {
  words: {[wordID: string]: MergeTreeWord};
  dropWord?: () => void;
  draggedSense?: MergeTreeReference;
  moveSense?: (src: MergeTreeReference, dest: MergeTreeReference) => void;
}

//interface for component state
export interface MergeDupStepState {}

class MergeDupStep extends React.Component<
  MergeDupStepProps & LocalizeContextProps,
  MergeDupStepState
  > {
  componentDidMount() {
    /*if (this.props.refreshListWords) {
      this.props.refreshListWords();
    }*/
  }

  dragDrop() {
    if (this.props.moveSense && this.props.draggedSense && this.props.dropWord) {
      let ref = {
        word: uuid(),
        sense: uuid(),
        duplicate: uuid()
      };
      this.props.moveSense(this.props.draggedSense, ref);
      this.props.dropWord();
    }
  }

  next() {
    //if (this.props.applyMerges) this.props.applyMerges();
  }

  render() {
    //visual definition
    return (
      <Box style={{maxHeight: "100%"}}>
        <Grid container>
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
          >>
          </GridListTile>

          {/* Merging pane */}
          <GridListTile
            cols={4}
            style={{...HEIGHT_STYLE, minWidth: "65vw", maxWidth: "75vw"}}
          >
            <div style={{...HEIGHT_STYLE, overflowY: "scroll"}}>
              <Grid item style={{flex: 1}}>
                {Object.keys(this.props.words).map(key =>
                  <MergeRow wordID={key} />
                )}

                <Box
                  style={{height: "100%"}}
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
                      <Card style={{...styleAddendum.inactive, width: 200}}>
                        <CardContent>Drag new root word Here</CardContent>
                      </Card>
                    }
                  </Grid>
                </Box>
              </Grid>
            </div>
          </GridListTile>

          {/* Merge button */}
          <GridListTile cols={5} style={{borderTop: "1px solid gray"}}>
            <Button
              style={{float: "right", margin: 10}}
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
