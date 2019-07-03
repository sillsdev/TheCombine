import * as React from "react";
import {
  LocalizeContextProps,
  withLocalize,
  Translate
} from "react-localize-redux";
import { Grid, Typography } from "@material-ui/core";
import { Word } from "../../../../types/word";
import * as backend from "../../../../backend";
import WordTile from "./WordTileComponent";

export interface SampleWordsProps {
  setInventory: (inventory: string[]) => void;
  inventory: string[];
}

interface SampleWordsState {
  words: string[];
  dragChar: string;
  dropChar: string;
  ignoreList: string[]; // A list of words we don't want to see right now
}

class SampleWords extends React.Component<
  SampleWordsProps & LocalizeContextProps,
  SampleWordsState
> {
  constructor(props: SampleWordsProps & LocalizeContextProps) {
    super(props);
    this.state = {
      words: [],
      dragChar: "",
      dropChar: "",
      ignoreList: []
    };
  }

  allWords: Word[] = [];

  async componentDidMount() {
    this.allWords = await backend.getFrontierWords();
    this.getWords();
  }

  componentDidUpdate(prevProps: SampleWordsProps & LocalizeContextProps) {
    if (prevProps.inventory !== this.props.inventory) this.getWords();
  }

  /**
   * Gets the words that don't fit the character inventory
   */
  async getWords() {
    const NUM_WORDS = 5; // The max number of words we want to display on the page

    let inv = [...this.props.inventory];
    let sampleWords: string[] = [];

    let word;
    for (let i: number = 0; i < this.allWords.length; i++) {
      if (sampleWords.length >= NUM_WORDS) break;
      word = this.allWords[i].vernacular;
      if (this.state.ignoreList.indexOf(word) === -1)
        // don't check word if it's in the ignore list
        for (let j: number = 0; j < word.length; j++) {
          if (inv.indexOf(word[j]) === -1 && word[j] !== " ") {
            sampleWords.push(word);
            break;
          }
        }
    }

    this.setState({
      words: [...sampleWords]
    });
  }

  /**
   * Adds all characters from the word into the character inventory
   */
  addWordToCharSet(word: string) {
    this.props.setInventory([
      ...this.props.inventory,
      ...word.replace(/\s/g, "").split("") //remove whitespace and break up word into chars
    ]);

    this.getWords(); // refresh the list
  }

  /**
   * Adds a word to the list of words that won't show up
   */
  addWordToIgnoreList(word: string) {
    this.setState({ ignoreList: [...this.state.ignoreList, word] });
    this.getWords(); // refresh the list
  }

  render() {
    return (
      <Grid
        container
        spacing={2}
        direction="row"
        justify="flex-start"
        alignItems="center"
      >
        <Grid item xs={12}>
          <Typography component="h1" variant="h4">
            <Translate id="charInventory.sampleWords.title" />
          </Typography>
          <Typography variant="subtitle1">
            <Translate id="charInventory.sampleWords.description" />
          </Typography>
        </Grid>
        {this.state.words.map(word => (
          <WordTile
            word={word}
            inventory={this.props.inventory}
            addWordToCharSet={word => this.addWordToCharSet(word)}
            addWordToIgnoreList={word => this.addWordToIgnoreList(word)}
          />
        ))}
        <Grid item xs={12} />
      </Grid>
    );
  }
}

export default withLocalize(SampleWords);
