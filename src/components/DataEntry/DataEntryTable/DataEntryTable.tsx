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
import SpellChecker from "../spellChecker";
import { ExistingEntry } from "./ExistingEntry/ExistingEntry";
import { NewEntry } from "./NewEntry/NewEntry";
import { ImmutableExistingEntry } from "./ExistingEntry/ImmutableExistingEntry";

interface DataEntryTableProps {
  domain: DomainTree;
  semanticDomain: SemanticDomain;
}

interface WordAccess {
  word: Word;
  mutable: boolean;
}

interface DataEntryTableState {
  existingWords: Word[];
  recentlyAddedWords: WordAccess[];
  displayDuplicatesIndex?: number;
  displaySpellingSuggestionsIndex?: number;
}


async function getWordsFromBackend(): Promise<Word[]> {
  let words = await Backend.getFrontierWords();
  words = filterWords(words);
  return words;
}

/** Filter out words that do not have correct accessibility */
export function filterWords(words: Word[]): Word[] {
  let filteredWords: Word[] = [];
  for (let word of words) {
    let shouldInclude = true;
    for (let sense of word.senses) {
      if (sense.accessibility !== State.active) {
        shouldInclude = false;
        break;
      }
    }
    if (shouldInclude) {
      filteredWords.push(word);
    }
  }
  return filteredWords;
}

/**
 * A data entry table containing word entries
 */
export class DataEntryTable extends React.Component<

  DataEntryTableProps & LocalizeContextProps,
  DataEntryTableState
> {
  constructor(props: DataEntryTableProps & LocalizeContextProps) {
    super(props);
    this.state = {
      existingWords: [],
      recentlyAddedWords: []
    };

    this.spellChecker = new SpellChecker();
  }

  spellChecker: SpellChecker;

  async componentDidMount() {
    let allWords = await getWordsFromBackend();
    this.setState({
      existingWords: allWords
    });
  }

  /** Finished with this page of words, select new semantic domain */
  // TODO: Implement
  submit(e?: React.FormEvent<HTMLFormElement>, callback?: Function) {
    if (e) e.preventDefault();
  }

  async addNewWord(wordToAdd: Word) {
    let updatedWord = await Backend.createWord(wordToAdd);
    let updatedNewWords = [...this.state.recentlyAddedWords];
    updatedNewWords.push({ word: updatedWord, mutable: true });
    let words: Word[] = await getWordsFromBackend();
    this.setState({
      existingWords: words,
      recentlyAddedWords: updatedNewWords
    });
  }

  /** Update the word in the backend and the frontend */
  async updateWordForNewEntry(wordToUpdate: Word) {
    let existingWord = this.state.existingWords.find(
      word => word.id === wordToUpdate.id
    );
    if (!existingWord)
      throw new Error("You are trying to update a nonexistent word");
    let index = this.state.existingWords.indexOf(existingWord);
    if (index === -1) throw new Error(wordToUpdate + " does not exist");

    let updatedWord: Word = await this.updateWordInBackend(wordToUpdate);

    let recentlyAddedWords = [...this.state.recentlyAddedWords];
    let updatedWordAccess: WordAccess = { word: updatedWord, mutable: false };
    recentlyAddedWords.push(updatedWordAccess);
    this.setState({ recentlyAddedWords: recentlyAddedWords });
  }

  async updateExistingWord(wordToUpdate: Word, wordToDelete?: Word) {
    let updatedWord: Word = await this.updateWordInBackend(wordToUpdate);
    let recentlyAddedWords = [...this.state.recentlyAddedWords];
    let frontendWords: Word[] = recentlyAddedWords.map(
      wordAccess => wordAccess.word
    );

    if (wordToDelete) {
      // Delete word from backend, then replace word in frontend with updated one
      let index = frontendWords.findIndex(w => w.id === wordToDelete.id);
      if (index === -1) {
        console.log("Word does not exist in recentlyAddedWords");
      } else {
        let updatedWordAccess: WordAccess = {
          word: updatedWord,
          mutable: false
        };
        this.updateWordInFrontend(index, updatedWordAccess);
        this.deleteWordAndUpdateExistingWords(wordToDelete);
      }
    } else {
      // Update word
      let index = frontendWords.findIndex(w => w.id === wordToUpdate.id);
      if (index === -1) {
        console.log("Word does not exist in recentlyAddedWords");
      } else {
        let updatedWordAccess: WordAccess = {
          word: updatedWord,
          mutable: true
        };
        this.updateWordInFrontend(index, updatedWordAccess);
      }
    }
  }

  updateWordInFrontend(index: number, updatedWord: WordAccess) {
    let recentlyAddedWords: WordAccess[] = [...this.state.recentlyAddedWords];
    recentlyAddedWords.splice(index, 1, updatedWord);
    this.setState({ recentlyAddedWords });
  }

  async updateWordInBackend(wordToUpdate: Word): Promise<Word> {
    let updatedWord = await Backend.updateWord(wordToUpdate);
    let words = await getWordsFromBackend();
    this.setState({ existingWords: words });
    return updatedWord;
  }

  async removeWord(word: Word) {
    this.deleteWordAndUpdateExistingWords(word);
    this.removeWordFromDisplay(word);
  }

  async deleteWordAndUpdateExistingWords(word: Word) {
    let deletedWord = await Backend.deleteWord(word);
    let existingWords: Word[] = await getWordsFromBackend();
    this.setState({ existingWords });
  }

  removeWordFromDisplay(word: Word) {
    let recentlyAddedWords: WordAccess[] = this.state.recentlyAddedWords.filter(
      wordAccess => wordAccess.word.id !== word.id
    );
    this.setState({ recentlyAddedWords });
  }

  toggleDisplayDuplicates(index: number) {
    if (this.state.displayDuplicatesIndex === index)
      this.setState({ displayDuplicatesIndex: undefined });
    else this.setState({ displayDuplicatesIndex: index });
  }

  toggleDisplaySpellingSuggestions(index: number) {
    if (this.state.displaySpellingSuggestionsIndex === index)
      this.setState({ displaySpellingSuggestionsIndex: undefined });
    else this.setState({ displaySpellingSuggestionsIndex: index });
  }

  render() {
    return (
      <form
        onSubmit={(e?: React.FormEvent<HTMLFormElement>, callback?: Function) =>
          this.submit(e, callback)
        }
      >
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

          {this.state.recentlyAddedWords.map((wordAccess, index) =>
            wordAccess.mutable ? (
              <React.Fragment>
                <ExistingEntry
                  wordsBeingAdded={this.state.recentlyAddedWords.map(
                    wordAccess => wordAccess.word
                  )}
                  existingWords={this.state.existingWords}
                  entryIndex={index}
                  entry={wordAccess.word}
                  updateWord={(wordToUpdate: Word, wordToDelete?: Word) =>
                    this.updateExistingWord(wordToUpdate, wordToDelete)
                  }
                  removeWord={(word: Word) => this.removeWord(word)}
                  spellChecker={this.spellChecker}
                  semanticDomain={this.props.semanticDomain}
                  displayDuplicates={
                    this.state.displayDuplicatesIndex === index
                  }
                  toggleDisplayDuplicates={() => {
                    this.toggleDisplayDuplicates(index);
                  }}
                  displaySpellingSuggestions={
                    this.state.displaySpellingSuggestionsIndex === index
                  }
                  toggleDisplaySpellingSuggestions={() => {
                    this.toggleDisplaySpellingSuggestions(index);
                  }}
                />
              </React.Fragment>
            ) : (
              <ImmutableExistingEntry
                vernacular={wordAccess.word.vernacular}
                gloss={
                  wordAccess.word.senses[wordAccess.word.senses.length - 1]
                    .glosses[
                    wordAccess.word.senses[wordAccess.word.senses.length - 1]
                      .glosses.length - 1
                  ].def
                }
              />
            )
          )}
          <NewEntry
            allWords={this.state.existingWords}
            updateWord={(wordToUpdate: Word) =>
              this.updateWordForNewEntry(wordToUpdate)
            }
            addNewWord={(word: Word) => this.addNewWord(word)}
            spellChecker={this.spellChecker}
            semanticDomain={this.props.semanticDomain}
            displayDuplicates={
              this.state.displayDuplicatesIndex ===
              this.state.recentlyAddedWords.length
            }
            toggleDisplayDuplicates={() => {
              this.toggleDisplayDuplicates(
                this.state.recentlyAddedWords.length
              );
            }}
            displaySpellingSuggestions={
              this.state.displaySpellingSuggestionsIndex ===
              this.state.recentlyAddedWords.length
            }
            toggleDisplaySpellingSuggestions={() => {
              this.toggleDisplaySpellingSuggestions(
                this.state.recentlyAddedWords.length
              );
            }}
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

export default withLocalize(DataEntryTable);
