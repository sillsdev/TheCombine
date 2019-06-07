//external modules
import * as React from "react";
import { LocalizeContextProps, withLocalize } from "react-localize-redux";
import { Word } from "../../../../types/word";
import {
  CardContent,
  Card,
  List,
  ListItem,
  ListSubheader
} from "@material-ui/core";
import { dropWord } from "../../../DraggableWord/actions";

//interface for component props
export interface WordListProps {
  words: Word[];
  dragWord?: (word: Word) => void;
  dropWord?: () => void;
  draggedWord?: Word;
}

//interface for component state
interface WordListState {
  words: Word[];
}

class WordList extends React.Component<
  WordListProps & LocalizeContextProps,
  WordListState
> {
  constructor(props: WordListProps & LocalizeContextProps) {
    super(props);
    this.state = { words: props.words };
  }

  drag(word: Word) {
    if (this.props.dragWord) {
      this.props.dragWord(word);
    }
  }

  dragEnd(word: Word) {
    if (this.props.draggedWord && this.props.dropWord) {
      this.props.dropWord();
    } else {
      var index = this.state.words.indexOf(word);
      this.setState({
        words: this.state.words.filter((_, i) => i != index)
      });
    }
  }

  drop() {
    if (this.props.draggedWord && this.props.dropWord) {
      var words = this.state.words;
      words.push(this.props.draggedWord);
      this.setState({ words });
      this.props.dropWord();
    }
  }

  render() {
    //visual definition
    return (
      <List
        onDragOver={e => e.preventDefault()}
        onDrop={_ => this.drop()}
        subheader={<ListSubheader> Duplicates</ListSubheader>}
      >
        {this.state.words.map(item => (
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
    );
  }
}

//export class as default
export default withLocalize(WordList);
