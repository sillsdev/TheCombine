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
  allCharacters: string[];
}

interface SampleWordsState {
  words: string[];
  dragChar: string;
  dropChar: string;
  ignoreList: string[]; // A list of words we don't want to see right now
}

export class SampleWords extends React.Component<
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
    this.canGetWords = true;
  }

  allWords: Word[] = [];
  private canGetWords: boolean;

  async componentDidMount() {
    this.allWords = await backend.getFrontierWords();
    /*
      Bypass the situation where this async call outlives the object This prevents the component from being unmounted during the API call, then having getWords
      (with setState) being called on an unmounted component. While that just creates a warning for now, it may become a full-fledged error in the future.
    */
    if (this.canGetWords) this.getWords();
  }

  componentDidUpdate(prevProps: SampleWordsProps & LocalizeContextProps) {
    if (prevProps.allCharacters !== this.props.allCharacters) this.getWords();
  }

  componentWillUnmount() {
    // Tell the program to not attempt running getWords (and thus setting state) after this point
    this.canGetWords = false;
  }

  /**
   * Gets the words that don't fit the character inventory
   */
  getWords() {
    const NUM_WORDS = 5; // The max number of words we want to display on the page

    let inv = [...this.props.allCharacters];
    let sampleWords: string[] = [];

    let word;
    for (let i: number = 0; i < this.allWords.length; i++) {
      if (sampleWords.length >= NUM_WORDS) break;
      word = this.allWords[i].vernacular;
      // don't check word if it's in the ignore list
      if (this.state.ignoreList.indexOf(word) === -1)
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

  /** Adds all characters from the word into the character inventory */
  addWordToCharSet(word: string) {
    this.props.setInventory([
      ...this.props.allCharacters,
      ...word.replace(/\s/g, "").split("") //remove whitespace and break up word into chars
    ]);

    this.getWords(); // refresh the list
  }

  /** Adds a word to the list of words that won't show up */
  addWordToIgnoreList(word: string) {
    this.setState(
      { ignoreList: [...this.state.ignoreList, word] },
      () => this.getWords() // refresh the list
    );
  }

  render() {
    return (
      <Grid
        container
        spacing={2}
        direction="row"
        justify="flex-start"
        alignItems="center"
        style={{ borderLeft: "1px solid #ccc", height: "100%" }}
      >
        <Grid item xs={12}>
          <Typography component="h1" variant="h4">
            <Translate id="charInventory.sampleWords.title" />
          </Typography>
          <Typography variant="subtitle1">
            <Translate id="charInventory.sampleWords.description" />
          </Typography>
        </Grid>
        {this.state.words.map((word: string, index: number) => (
          <WordTile
            key={word + index + "tile"}
            word={word}
            allCharacters={this.props.allCharacters}
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
