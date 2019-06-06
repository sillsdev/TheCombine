/* THIS COMPONENT IS INTENDED TO BE AN EXAMPLE ONLY. 
  IT WILL NOT BE USED IN THE APPLICATION.
*/

//external modules
import * as React from "react";
import { LocalizeContextProps, withLocalize } from "react-localize-redux";
import { Word } from "../../../../types/word";
import { minHeight, minWidth } from "@material-ui/system";
import { Box, CardContent, Card } from "@material-ui/core";

//interface for component props
export interface MergeStackProps {
  draggedWord?: Word;
  dropWord?: () => void;
  startingWords?: Word[];
}

//interface for component state
interface MergeStackState {
  words: Word[];
}

class MergeStack extends React.Component<
  MergeStackProps & LocalizeContextProps,
  MergeStackState
> {
  constructor(props: MergeStackProps & LocalizeContextProps) {
    super(props);
    this.state = { words: [] };
    if (props.startingWords) {
      this.state = { words: props.startingWords };
    }
  }

  addWord(word: Word) {
    var stack = this.state.words;
    stack.push(word);
    this.setState({ words: stack });
  }

  dragDrop(event: React.DragEvent<HTMLElement>) {
    event.preventDefault();

    if (this.props.draggedWord && this.props.dropWord) {
      this.addWord(this.props.draggedWord);
      this.props.dropWord();
    }
  }

  render() {
    // get last card
    var card = this.state.words[this.state.words.length - 1];
    var display = "";
    if (card) {
      display = card.gloss;
    }
    //visual definition
    return (
      <Card
        onDragOver={e => e.preventDefault()}
        onDrop={e => {
          this.dragDrop(e);
        }}
      >
        <CardContent>{display}</CardContent>
      </Card>
    );
  }
}

//export class as default
export default withLocalize(MergeStack);
