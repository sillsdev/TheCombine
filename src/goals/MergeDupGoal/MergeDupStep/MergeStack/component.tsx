//external modules
import * as React from "react";
import { LocalizeContextProps, withLocalize } from "react-localize-redux";
import { Word } from "../../../../types/word";
import { Box, CardContent, Card } from "@material-ui/core";

//interface for component props
export interface MergeStackProps {
  parent: Word;
}

//interface for component state
interface MergeStackState {}

class MergeStack extends React.Component<
  MergeStackProps & LocalizeContextProps,
  MergeStackState
> {
  constructor(props: MergeStackProps & LocalizeContextProps) {
    super(props);
  }

  addWord(word: Word) {
    console.log("UNIMPLEMENTED");
  }

  dragDrop(event: React.DragEvent<HTMLElement>) {
    event.preventDefault();

    console.log("UNIMPLEMENTED");
  }

  render() {
    // get last card
    //visual definition
    return (
      <Box style={{ width: 200 }}>
        <Card
          onDragOver={e => e.preventDefault()}
          onDrop={e => {
            this.dragDrop(e);
          }}
        >
          <CardContent>{this.props.parent.vernacular}</CardContent>
          <CardContent>{this.props.parent.gloss}</CardContent>
        </Card>
      </Box>
    );
  }
}

//export class as default
export default withLocalize(MergeStack);
