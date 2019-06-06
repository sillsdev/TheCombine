/* THIS COMPONENT IS INTENDED TO BE AN EXAMPLE ONLY. 
  IT WILL NOT BE USED IN THE APPLICATION.
*/

//external modules
import * as React from "react";
import { LocalizeContextProps, withLocalize } from "react-localize-redux";
import { Word } from "../../../../types/word";
import { minHeight, minWidth } from "@material-ui/system";
import { Box } from "@material-ui/core";

//interface for component props
export interface MergeStackProps {
  draggedWord?: Word;
  dropWord?: () => void;
}

//interface for component state
interface MergeStackState {
  cards: Word[];
}

class MergeStack extends React.Component<
  MergeStackProps & LocalizeContextProps,
  MergeStackState
> {
  constructor(props: MergeStackProps & LocalizeContextProps) {
    super(props);

    this.state = { cards: [] };
  }

  dragDrop(event: React.DragEvent<HTMLElement>) {
    event.preventDefault();
    if (this.props.draggedWord) {
      var stack = this.state.cards;
      stack.push(this.props.draggedWord);
      this.setState({ cards: stack });
    }
  }

  render() {
    // get last card
    var card = this.state.cards[this.state.cards.length - 1];
    var display = "";
    if (card) {
      display = card.gloss;
    }
    //visual definition
    return (
      <Box
        minWidth={100}
        minHeight={100}
        bgcolor={"#555555"}
        className="MergeStack"
        onDragOver={e => e.preventDefault()}
        onDrop={e => {
          this.dragDrop(e);
        }}
      >
        {display}
      </Box>
    );
  }
}

//export class as default
export default withLocalize(MergeStack);
