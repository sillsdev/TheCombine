//external modules
import * as React from "react";
import { LocalizeContextProps, withLocalize } from "react-localize-redux";
import { Word, simpleWord } from "../../../../types/word";
import { Box, CardContent, Card } from "@material-ui/core";
import { Sense } from "../component";

//interface for component props
export interface MergeStackProps {
  sense: Sense;
  addDuplicate?: (word: Word, parent: Word) => void;
  dropWord?: () => void;
  draggedWord?: Word;
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
    if (this.props.addDuplicate && this.props.dropWord) {
      console.log("Trying to add dup: " + word.vernacular);
      this.props.addDuplicate(word, this.props.sense.parent);
      this.props.dropWord();
    }
  }

  dragDrop(event: React.DragEvent<HTMLElement>) {
    event.preventDefault();
    if (this.props.draggedWord) {
      this.addWord(this.props.draggedWord);
    }
  }

  render() {
    // get last card
    var lastCard = this.props.sense.dups[this.props.sense.dups.length - 1];
    if (!lastCard) {
      lastCard = simpleWord("Missing Word", "");
    }
    //visual definition
    return (
      <Box style={{ width: 200 }}>
        <Card
          onDragOver={e => e.preventDefault()}
          onDrop={e => {
            this.dragDrop(e);
          }}
        >
          <CardContent>{lastCard.vernacular}</CardContent>
          <CardContent>{lastCard.gloss}</CardContent>
        </Card>
      </Box>
    );
  }
}

//export class as default
export default withLocalize(MergeStack);
