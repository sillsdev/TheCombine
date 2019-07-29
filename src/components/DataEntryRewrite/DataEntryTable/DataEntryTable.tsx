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
  existingWords: Word[];
  newWords: Word[];
}

export class DataEntryTableRewrite extends React.Component<
  DataEntryTableProps & LocalizeContextProps,
  DataEntryTableState
> {
  constructor(props: DataEntryTableProps & LocalizeContextProps) {
    super(props);
    this.state = {
      existingWords: [],
      newWords: []
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
    this.setState({ existingWords: allWords });
  }

  /** Go back to the tree view */
  // Implement
  submit(e?: React.FormEvent<HTMLFormElement>, callback?: Function) {
    if (e) e.preventDefault();
  }

  async addNewWord(wordToAdd: Word) {
    let updatedWord = await this.addWordToBackend(wordToAdd);
    let updatedNewWords = { ...this.state.newWords };
    updatedNewWords.push(updatedWord);
    let words: Word[] = await this.getWordsFromBackend();
    this.setState({ existingWords: words, newWords: updatedNewWords });
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

  // MAYBE DELETE
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
    let existingWord = this.state.existingWords.find(
      word => word.id === wordToUpdate.id
    );
    if (!existingWord)
      throw new Error("You are trying to update a nonexistent word");
    let index = this.state.existingWords.indexOf(existingWord);
    if (index === -1) throw new Error(wordToUpdate + " does not exist");

    let updatedWord: Word = await this.updateWordInBackend(wordToUpdate);
    // console.log(updatedWord);
    // let updatedWords = await this.getWordsFromBackend();
    // this.setState({ existingWords: updatedWords });
  }

  // Backend
  async updateWordInBackend(wordToUpdate: Word): Promise<Word> {
    let updatedWord = await Backend.updateWord(wordToUpdate);
    let updatedNewWords: Word[] = { ...this.state.newWords };

    let indexOfUpdatedWord = 0;
    for (const [index, word] of updatedNewWords.entries()) {
      if (word.id === wordToUpdate.id) {
        indexOfUpdatedWord = index;
        break;
      }
    }

    updatedNewWords.splice(indexOfUpdatedWord, 1, updatedWord);

    let words = await this.getWordsFromBackend();
    this.setState({ existingWords: words, newWords: updatedNewWords });
    return updatedWord;
  }

  async removeWord(id: string) {
    let deletedWord: Word = await this.removeWordFromBackend(id);
    let updatedNewWords: Word[] = this.state.newWords.filter(
      word => word.id !== deletedWord.id
    );
    let updatedWords: Word[] = await this.getWordsFromBackend();
    this.setState({ existingWords: updatedWords, newWords: updatedNewWords });
  }

  // Backend
  // TODO: pass in a word instead of an id
  /** Remove a word from the database. */
  async removeWordFromBackend(id: string): Promise<Word> {
    let word = this.state.newWords.filter(word => word.id === id);
    console.log(word);
    let updatedWord = await Backend.deleteWord(word[0]);
    return updatedWord;
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

          {this.state.newWords.map((word, index) => (
            <ExistingEntry
              key={word.id}
              allWords={this.state.newWords}
              entryIndex={index}
              entry={word}
              updateWord={this.updateWord}
              removeWord={this.removeWord}
              spellChecker={this.spellChecker}
            />
          ))}
          <NewEntry
            allWords={this.state.newWords}
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
