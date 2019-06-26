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
import WordCard from "../WordCard";

// Constants
const OPACITY_GRAYED = 0.5;

//interface for component props
export interface WordListProps {
  words: Word[];
  dragWord?: (word: Word) => void;
  dropWord?: () => void;
  addListWord?: (word: Word[]) => void;
  removeListWord?: (word: Word[]) => void;
  draggedWord?: Word;
}

//interface for component state
interface WordListState {
  draggingFrom: boolean;
}

class WordList extends React.Component<
  WordListProps & LocalizeContextProps,
  WordListState
> {
  constructor(props: WordListProps & LocalizeContextProps) {
    super(props);

    // Bind functions
    this.obscureList = this.obscureList.bind(this);
    this.brightenList = this.brightenList.bind(this);
    this.state = { draggingFrom: false };
  }

  // Handles grayed-out options

  obscureList() {
    this.setState({ ...this.state, draggingFrom: true });
    window.addEventListener("dragend", this.brightenList);
  }

  brightenList() {
    this.setState({ ...this.state, draggingFrom: false });
    window.removeEventListener("dragend", this.brightenList);
  }

  // Handles word manipulation

  drag(word: Word) {
    if (this.props.dragWord) {
      this.props.dragWord(word);
    }
  }

  dragEnd(word: Word) {
    if (this.props.draggedWord && this.props.dropWord) {
      this.props.dropWord();
    } else if (this.props.removeListWord) {
      this.props.removeListWord([word]);
    }
  }

  drop() {
    if (
      this.props.draggedWord &&
      this.props.dropWord &&
      this.props.addListWord
    ) {
      this.props.addListWord([this.props.draggedWord]);
      this.props.dropWord();
    }
  }

  render() {
    //visual definition
    return (
      <div
        onDragStart={_ => this.obscureList()}
        onDragOver={e => e.preventDefault()}
        onDrop={_ => this.drop()}
      >
        <List subheader={<ListSubheader> Possible Duplicates</ListSubheader>}>
          {this.props.words.map(item => (
            <ListItem key={item.id}>
              <Card
                style={{
                  flex: 1,
                  opacity: this.state.draggingFrom ? OPACITY_GRAYED : 1.0
                }}
                draggable={true}
                onDragStart={_ => this.drag(item)}
                onDragEnd={_ => this.dragEnd(item)}
                title={
                  this.props.translate("mergeDups.helpText.list") as string
                }
              >
                <CardContent>
                  <WordCard word={item} />
                </CardContent>
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
