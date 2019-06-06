/* THIS COMPONENT IS INTENDED TO BE AN EXAMPLE ONLY. 
  IT WILL NOT BE USED IN THE APPLICATION.
*/

//external modules
import * as React from "react";
import { LocalizeContextProps, withLocalize } from "react-localize-redux";
import { Word } from "../../../../types/word";
import { isTemplateElement } from "@babel/types";
import { dragWord } from "../../../DraggableWord/actions";
import { CardContent, Typography, Card } from "@material-ui/core";
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
    console.log("Starting drag of: " + word.vernacular);
    if (this.props.dragWord) {
      this.props.dragWord(word);
    }
  }

  render() {
    //visual definition
    return (
      <div>
        {this.props.words.map((item, index) => (
          <Card draggable={true} onDragStart={_ => this.drag(item)}>
            <CardContent>{item.vernacular}</CardContent>
          </Card>
        ))}
      </div>
    );
  }
}

//export class as default
export default withLocalize(WordList);
