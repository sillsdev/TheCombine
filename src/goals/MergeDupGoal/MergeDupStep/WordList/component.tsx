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
interface WordListState {}

class WordList extends React.Component<
  WordListProps & LocalizeContextProps,
  WordListState
> {
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
        style={{ height: "90vh", overflowY: "scroll" }}
        onDragOver={e => e.preventDefault()}
        onDrop={_ => this.drop()}
      >
        <List subheader={<ListSubheader> Possible Duplicates</ListSubheader>}>
          {this.props.words.map(item => (
            <ListItem key={item.id}>
              <Card
                style={{ flex: 1 }}
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
