import React from "react";
import { Typography, Grid, Button } from "@material-ui/core";
import theme from "../../../types/theme";
import {
  Translate,
  LocalizeContextProps,
  withLocalize
} from "react-localize-redux";
import { Word, SemanticDomain, State } from "../../../types/word";
import * as Backend from "../../../backend";
import DomainTree from "../../TreeView/SemanticDomain";
import SpellChecker from "../../DataEntry/spellChecker";
import { ExistingEntry } from "./ExistingEntry/ExistingEntry";
import { NewEntry } from "./NewEntry/NewEntry";

interface DataEntryTableProps {
  domain: DomainTree;
  spellChecker: SpellChecker;
  semanticDomain: SemanticDomain;
}

interface DataEntryTableState {
  words: Word[];
}

export class DataEntryTableRewrite extends React.Component<
  DataEntryTableProps & LocalizeContextProps,
  DataEntryTableState
> {
  constructor(props: DataEntryTableProps & LocalizeContextProps) {
    super(props);
    this.state = {
      words: []
    };

    this.spellChecker = new SpellChecker();

    this.submit = this.submit.bind(this);
    this.updateWord = this.updateWord.bind(this);
    this.removeWord = this.removeWord.bind(this);
    this.addNewWord = this.addNewWord.bind(this);
  }

  spellChecker: SpellChecker;

  async componentDidMount() {
    let allWords = await this.getWordsFromBackend();
    this.setState({ words: allWords });
  }

  /** Go back to the tree view */
  // Implement
  submit(e?: React.FormEvent<HTMLFormElement>, callback?: Function) {
    if (e) e.preventDefault();
  }

  async addNewWord(wordToAdd: Word) {
    let updatedWord = await this.addWordToBackend(wordToAdd);
    let words: Word[] = await this.getWordsFromBackend();
    this.setState({ words: words });
  }

  // Backend
  async addWordToBackend(word: Word): Promise<Word> {
    let updatedWord = await Backend.createWord(word);
    return updatedWord;
  }

  // Backend
  async getWordsFromBackend(): Promise<Word[]> {
    let words = await Backend.getFrontierWords();
    words = this.filterWords(words);
    return words;
  }

  /** Filter out words that do not have correct accessibility */
  filterWords(words: Word[]): Word[] {
    for (let word of words) {
      for (let sense of word.senses) {
        if (sense.accessibility !== State.active) {
          // Don't include sense
          console.log("Word not accessible");
        }
      }
    }
    return words;
  }

  /** Update the word in the backend and the frontend. Implement. */
  // Remove console logs
  async updateWord(wordToUpdate: Word) {
    let existingWord = this.state.words.find(
      word => word.id === wordToUpdate.id
    );
    if (!existingWord)
      throw new Error("You are trying to update a nonexistent word");
    let index = this.state.words.indexOf(existingWord);
    if (index === -1) throw new Error(wordToUpdate + " does not exist");

    let updatedWord: Word = await this.updateWordInBackend(wordToUpdate);
    console.log(updatedWord);
    let updatedWords = await this.getWordsFromBackend();
    this.setState({ words: updatedWords });
  }

  // Backend
  async updateWordInBackend(wordToUpdate: Word): Promise<Word> {
    let updatedWord = await Backend.updateWord(wordToUpdate);
    let words = await this.getWordsFromBackend();
    this.setState({ words: words });
    return updatedWord;
  }

  async removeWord(id: string) {
    await this.removeWordFromBackend(id);
    let updatedWords: Word[] = await this.getWordsFromBackend();
    this.setState({ words: updatedWords });
  }

  // Backend
  // TODO: pass in a word instead of an id
  /** Remove a word from the database. */
  async removeWordFromBackend(id: string) {
    let word = this.state.words.filter(word => word.id === id);
    console.log(word);
    Backend.deleteWord(word[0]);
  }

  render() {
    return (
      <form onSubmit={e => this.submit(e)}>
        <input type="submit" style={{ display: "none" }} />

        <Grid container spacing={3}>
          <Grid item xs={5}>
            <Typography
              variant="h5"
              align="center"
              style={{ marginTop: theme.spacing(2) }}
            >
              <Translate id="addWords.vernacular" />
            </Typography>
          </Grid>
          <Grid item xs={5}>
            <Typography
              variant="h5"
              align="center"
              style={{ marginTop: theme.spacing(2) }}
            >
              <Translate id="addWords.glosses" />
            </Typography>
          </Grid>

          {this.state.words.map((word, index) => (
            <ExistingEntry
              key={word.id}
              allWords={this.state.words}
              entryIndex={index}
              entry={word}
              updateWord={this.updateWord}
              removeWord={this.removeWord}
              spellChecker={this.spellChecker}
            />
          ))}
          <NewEntry
            allWords={this.state.words}
            updateWord={this.updateWord}
            addNewWord={this.addNewWord}
            spellChecker={this.spellChecker}
          />
        </Grid>

        <Grid container justify="flex-end" spacing={2}>
          <Grid item>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              style={{ marginTop: theme.spacing(2) }}
            >
              <Translate id="addWords.next" />
            </Button>
          </Grid>
        </Grid>
      </form>
    );
  }
}

export default withLocalize(DataEntryTableRewrite);
