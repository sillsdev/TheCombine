/* THIS COMPONENT IS INTENDED TO BE AN EXAMPLE ONLY. 
  IT WILL NOT BE USED IN THE APPLICATION.
*/

//external modules
import * as React from "react";
import { LocalizeContextProps, withLocalize } from "react-localize-redux";
import { Word, hasSenses } from "../../../../types/word";
import { Box, CardContent, Card } from "@material-ui/core";
import { Sense } from "../component";

//interface for component props
export interface MergeStackProps {
  sense: Sense;
  addDuplicate?: (word: Word, sense: number) => void;
  removeDuplicate?: (word: Word, sense: number) => void;
  dropWord?: () => void;
  dragWord?: (word: Word) => void;
  updateRow?: () => void;
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
      this.props.addDuplicate(word, this.props.sense.id);
      this.props.dropWord();
    }
  }

  dragDrop(event: React.DragEvent<HTMLElement>) {
    event.preventDefault();
    if (this.props.draggedWord && this.props.draggedWord != this.topCard()) {
      this.addWord(this.props.draggedWord);
    }
  }

  drag(word: Word) {
    if (this.props.dragWord) {
      this.props.dragWord(word);
    }
  }

  removeCard(word: Word) {
    if (this.props.draggedWord && this.props.dropWord) {
      this.props.dropWord();
    } else {
      if (this.props.removeDuplicate && this.props.updateRow) {
        this.props.removeDuplicate(word, this.props.sense.id);
        // force MergeRow to update even though react think we didn't update any of MergeWord's props
        this.props.updateRow();
      }
    }
  }

  topCard(): Word {
    return this.props.sense.dups[this.props.sense.dups.length - 1];
  }

  render_single() {
    var lastCard = this.topCard();
    return (
      <Box style={{ width: 200 }}>
        <Card
          draggable={true}
          onDragStart={_ => this.drag(lastCard)}
          onDragEnd={_ => this.removeCard(lastCard)}
          onDragOver={e => e.preventDefault()}
          onDrop={e => {
            this.dragDrop(e);
          }}
        >
          <CardContent>{lastCard.vernacular}</CardContent>
          <CardContent>
            {hasSenses(lastCard)
              ? lastCard.senses[0].glosses[0].def
              : "no gloss"}
            <div
              style={{
                float: "right",
                position: "relative",
                bottom: 0,
                right: 0
              }}
            >
              {this.props.sense.dups.length > 1
                ? this.props.sense.dups.length
                : ""}
            </div>
          </CardContent>
        </Card>
      </Box>
    );
  }

  render_stack() {
    return (
      <Card style={{ paddingBottom: 2, paddingRight: 2 }}>
        {this.render_single()}
      </Card>
    );
  }

  render() {
    //visual definition
    if (this.props.sense.dups.length > 1) {
      return this.render_stack();
    } else {
      return this.render_single();
    }
  }
}

//export class as default
export default withLocalize(MergeStack);
