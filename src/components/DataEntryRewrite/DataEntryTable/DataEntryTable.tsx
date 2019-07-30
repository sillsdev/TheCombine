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
import { SpellingSuggestionsView } from "./SpellingSuggestions/SpellingSuggestions";
import { DuplicateResolutionView } from "./DuplicateResolutionView/DuplicateResolutionView";

interface DataEntryTableProps {
  domain: DomainTree;
  spellChecker: SpellChecker;
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
}

export class DataEntryTableRewrite extends React.Component<
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

    this.submit = this.submit.bind(this);
    this.updateWordForNewEntry = this.updateWordForNewEntry.bind(this);
    this.updateExistingWord = this.updateExistingWord.bind(this);
    this.removeWord = this.removeWord.bind(this);
    this.addNewWord = this.addNewWord.bind(this);
  }

  spellChecker: SpellChecker;

  async componentDidMount() {
    let allWords = await this.getWordsFromBackend();
    // let allWords: Word[] = [
    //   {
    //     id: "",
    //     vernacular: "wapow",
    //     senses: [
    //       {
    //         glosses: [
    //           {
    //             language: "en",
    //             def: "to poop"
    //           }
    //         ],
    //         semanticDomains: [
    //           {
    //             name: "Stuff",
    //             id: "1.1.1"
    //           }
    //         ],
    //         accessibility: State.active
    //       }
    //     ],
    //     audio: [],
    //     created: "",
    //     modified: "",
    //     history: [],
    //     partOfSpeech: "",
    //     editedBy: [],
    //     : State.active,
    //     otherField: "",
    //     plural: ""
    //   },
    //   {
    //     id: "",
    //     vernacular: "kaching",
    //     senses: [
    //       {
    //         glosses: [
    //           {
    //             language: "en",
    //             def: "money"
    //           }
    //         ],
    //         semanticDomains: [
    //           {
    //             name: "Other",
    //             id: "2.2.2"
    //           }
    //         ],
    //         accessibility: State.active
    //       }
    //     ],
    //     audio: [],
    //     created: "",
    //     modified: "",
    //     history: [],
    //     partOfSpeech: "",
    //     editedBy: [],
    //     : State.active,
    //     otherField: "",
    //     plural: ""
    //   }
    // ];

    // let wordsWithAccess: WordAccess[] = allWords.map((word, index) => {
    //   let wordWithAccess: WordAccess;
    //   if (index % 2 == 0) {
    //     wordWithAccess = { word, mutable: false };
    //   } else {
    //     wordWithAccess = { word, mutable: true };
    //   }
    //   return wordWithAccess;
    // });

    this.setState({
      existingWords: allWords
    });
  }

  /** Go back to the tree view */
  // TODO: Implement
  submit(e?: React.FormEvent<HTMLFormElement>, callback?: Function) {
    if (e) e.preventDefault();
  }

  async addNewWord(wordToAdd: Word) {
    let updatedWord = await this.addWordToBackend(wordToAdd);
    let updatedNewWords = [...this.state.recentlyAddedWords];
    updatedNewWords.push({ word: updatedWord, mutable: true });
    let words: Word[] = await this.getWordsFromBackend();
    this.setState({
      existingWords: words,
      recentlyAddedWords: updatedNewWords
    });
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

  async updateExistingWord(
    wordToUpdate: Word,
    wordToDelete?: Word,
    duplicate?: Word
  ) {
    let existingWord = this.state.existingWords.find(
      word => word.id === wordToUpdate.id
    );

    if (!existingWord)
      throw new Error("You are trying to update a nonexistent word");
    let index = this.state.existingWords.indexOf(existingWord);
    if (index === -1) throw new Error(wordToUpdate + " does not exist");

    let updatedWord: Word = await this.updateWordInBackend(wordToUpdate);

    let recentlyAddedWords = [...this.state.recentlyAddedWords];
    let updatedWordAccess: WordAccess = { word: updatedWord, mutable: true };
    if (duplicate && wordToDelete) {
      // Delete word
      recentlyAddedWords.filter(word => word.word.id !== wordToDelete.id);
      updatedWordAccess = { word: updatedWord, mutable: false };
    }
    let frontendWords: Word[] = this.state.recentlyAddedWords.map(
      wordAccess => wordAccess.word
    );
    let newWordsIndex = this.getIndexOfWordWithId(wordToUpdate, frontendWords);
    if (newWordsIndex === -1) {
      console.log("Word does not exist in recentlyAddedWords");
    }
    this.updateWordInFrontend(newWordsIndex, updatedWordAccess);
  }

  private getIndexOfWordWithId(wordToFind: Word, allWords: Word[]): number {
    for (const [i, word] of allWords.entries()) {
      if (word.id === wordToFind.id) {
        return i;
      }
    }
    return -1;
  }

  updateWordInFrontend(index: number, updatedWord: WordAccess) {
    let updatedWordAccess: WordAccess[] = [...this.state.recentlyAddedWords];
    updatedWordAccess.splice(index, 1, updatedWord);
    this.setState({ recentlyAddedWords: updatedWordAccess });
  }

  // Backend
  async updateWordInBackend(wordToUpdate: Word): Promise<Word> {
    let updatedWord = await Backend.updateWord(wordToUpdate);
    let words = await this.getWordsFromBackend();
    this.setState({ existingWords: words });
    return updatedWord;
  }

  async removeWord(id: string) {
    // let deletedWord: Word = await this.removeWordFromBackend(id);
    // let updatedNewWords: Word[] = this.state.recentlyAddedWords.filter(
    //   word => word.id !== deletedWord.id
    // );
    // let updatedWords: Word[] = await this.getWordsFromBackend();
    // this.setState({
    //   existingWords: updatedWords,
    //   recentlyAddedWords: updatedNewWords
    // });
  }

  toggleDisplayDuplicates(index: number) {
    if (this.state.displayDuplicatesIndex === index)
      this.setState({ displayDuplicatesIndex: undefined });
    else this.setState({ displayDuplicatesIndex: index });
  }

  // Backend
  // TODO: pass in a word instead of an id
  /** Remove a word from the database. */
  // async removeWordFromBackend(id: string): Promise<Word> {
  //   let word = this.state.recentlyAddedWords.filter(word => word.id === id);
  //   console.log(word);
  //   let updatedWord = await Backend.deleteWord(word[0]);
  //   return updatedWord;
  // }

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

          {this.state.recentlyAddedWords.map((wordAccess, index) =>
            wordAccess.mutable ? (
              <React.Fragment>
                <ExistingEntry
                  key={wordAccess.word.id}
                  wordsBeingAdded={this.state.recentlyAddedWords.map(
                    wordAccess => wordAccess.word
                  )}
                  existingWords={this.state.existingWords}
                  entryIndex={index}
                  entry={wordAccess.word}
                  updateWord={this.updateExistingWord}
                  // removeWord={this.removeWord}
                  spellChecker={this.spellChecker}
                  semanticDomain={this.props.semanticDomain}
                  displayDuplicates={
                    this.state.displayDuplicatesIndex === index
                  }
                  toggleDisplayDuplicates={() => {
                    this.toggleDisplayDuplicates(index);
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
            updateWord={this.updateWordForNewEntry}
            addNewWord={this.addNewWord}
            spellChecker={this.spellChecker}
            semanticDomain={this.props.semanticDomain}
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
