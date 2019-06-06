/* THIS COMPONENT IS INTENDED TO BE AN EXAMPLE ONLY. 
  IT WILL NOT BE USED IN THE APPLICATION.
*/

//external modules
import * as React from "react";
import { LocalizeContextProps, withLocalize } from "react-localize-redux";
import { Word } from "../../../../types/word";
import { isTemplateElement } from "@babel/types";
import { dragWord } from "../../../DraggableWord/actions";
import {
  CardContent,
  Typography,
  Card,
  List,
  ListItem,
  ListSubheader
} from "@material-ui/core";
import classes from "*.module.css";

//interface for component props
export interface WordListProps {
  words: Word[];
  dragWord?: (word: Word) => void;
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

  render() {
    //visual definition
    return (
      <List subheader={<ListSubheader> Duplicates</ListSubheader>}>
        {this.props.words.map((item, index) => (
          <ListItem>
            <Card
              style={{ flex: 1 }}
              draggable={true}
              onDragStart={_ => this.drag(item)}
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
