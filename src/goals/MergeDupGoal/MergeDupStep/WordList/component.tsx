/* THIS COMPONENT IS INTENDED TO BE AN EXAMPLE ONLY. 
  IT WILL NOT BE USED IN THE APPLICATION.
*/

//external modules
import * as React from "react";
import { LocalizeContextProps, withLocalize } from "react-localize-redux";
import { Word } from "../../../../types/word";
import {
  CardContent,
  Card,
  List,
  ListItem,
  ListSubheader,
  Button
} from "@material-ui/core";
import { backend } from "../component";

//interface for component props
export interface WordListProps {
  words: Word[];
  dragWord?: (word: Word) => void;
  dropWord?: () => void;
  addListWord?: (word: Word) => void;
  removeListWord?: (word: Word) => void;
  draggedWord?: Word;
}

//interface for component state
interface WordListState {}

class WordList extends React.Component<
  WordListProps & LocalizeContextProps,
  WordListState
> {
  constructor(props: WordListProps & LocalizeContextProps) {
    super(props);
  }

  drag(word: Word) {
    if (this.props.dragWord) {
      this.props.dragWord(word);
    }
  }

  dragEnd(word: Word) {
    if (this.props.draggedWord && this.props.dropWord) {
      this.props.dropWord();
    } else if (this.props.removeListWord) {
      this.props.removeListWord(word);
    }
  }

  drop() {
    if (
      this.props.draggedWord &&
      this.props.dropWord &&
      this.props.addListWord
    ) {
      this.props.addListWord(this.props.draggedWord);
      this.props.dropWord();
    }
  }

  render() {
    //visual definition
    return (
      <div
        style={{ height: "100%" }}
        onDragOver={e => e.preventDefault()}
        onDrop={_ => this.drop()}
      >
        <List subheader={<ListSubheader> Duplicates</ListSubheader>}>
          {this.props.words.map(item => (
            <ListItem>
              <Card
                style={{ flex: 1 }}
                draggable={true}
                onDragStart={_ => this.drag(item)}
                onDragEnd={_ => this.dragEnd(item)}
              >
                <CardContent>{item.vernacular}</CardContent>
                <CardContent>{item.gloss}</CardContent>
              </Card>
            </ListItem>
          ))}
        </List>
      </div>
    );
  }
}

//export class as default
export default withLocalize(WordList);
