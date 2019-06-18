//external modules
import * as React from "react";
import { LocalizeContextProps, withLocalize } from "react-localize-redux";
import { Word } from "../../../../types/word";
import {
  ListSubheader,
  Box,
  Grid,
  Container,
  Card,
  CardContent
} from "@material-ui/core";
import MergeStack from "../MergeStack";
import { Sense, ParentWord } from "../component";

//interface for component props
export interface MergeRowProps {
  draggedWord?: Word;
  parent: ParentWord;
  addSense?: (word: Word, parent: number) => void;
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

  // this function is used to force this component to redraw itself when
  // the contents of parent change from the removeWord action in MergeStack
  update() {
    this.setState({});
  }

  add_sense(word: Word) {
    if (this.props.addSense) {
      this.props.addSense(word, this.props.parent.id);
    }
  }

  drop() {
    if (this.props.draggedWord && this.props.dropWord) {
      var word = this.props.draggedWord;
      word.modified = Date.now().toString();
      this.add_sense(word);
      this.props.dropWord();
    }
  }

  render() {
    //visual definition
    return (
      <Box style={{ flex: 1 }}>
        <ListSubheader
          onDragOver={e => e.preventDefault()}
          onDrop={_ => this.drop()}
        >
          <div style={{ textAlign: "center" }}>
            {this.props.parent.senses[0].dups[0].vernacular}
          </div>
          <hr />
        </ListSubheader>
        <Grid container>
          {this.props.parent.senses.map(item => (
            <Grid item>
              <MergeStack updateRow={() => this.update()} sense={item} />
            </Grid>
          ))}
          <Grid
            item
            onDragOver={e => e.preventDefault()}
            onDrop={_ => this.drop()}
          >
            {this.props.draggedWord && (
              <Card style={{ width: 200, backgroundColor: "#eee" }}>
                <CardContent>Drag new sense</CardContent>
                <CardContent>Here</CardContent>
              </Card>
            )}
          </Grid>
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
