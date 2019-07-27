import React from "react";
import { Typography, Grid, Button } from "@material-ui/core";
import theme from "../../../types/theme";
import {
  Translate,
  TranslateFunction,
  LocalizeContextProps,
  withLocalize
} from "react-localize-redux";
import { Word, SemanticDomain, State } from "../../../types/word";
import * as Backend from "../../../backend";
import DomainTree from "../../TreeView/SemanticDomain";
import SpellChecker from "../../DataEntry/spellChecker";
import { ExistingEntry } from "../ExistingEntry/ExistingEntry";
import { NewEntry } from "../NewEntry/NewEntry";

interface DataEntryTableProps {
  domain: DomainTree;
  translate: TranslateFunction;
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

    this.submit = this.submit.bind(this);
    this.updateWord = this.updateWord.bind(this);
    this.removeWord = this.removeWord.bind(this);
    this.addNewWord = this.addNewWord.bind(this);
  }

  componentDidMount() {
    let words: Word[] = [
      {
        id: "1",
        vernacular: "abcdefg",
        senses: [
          {
            glosses: [
              {
                language: "en",
                def: "Wait"
              }
            ],
            semanticDomains: [
              {
                name: "Universe",
                id: "1"
              }
            ],
            accessibility: State.active
          }
        ],
        audio: "",
        created: "",
        modified: "",
        history: [],
        partOfSpeech: "",
        editedBy: [],
        accessability: State.active,
        otherField: "",
        plural: ""
      },
      {
        id: "24",
        vernacular: "word",
        senses: [
          {
            glosses: [
              {
                language: "en",
                def: "What"
              }
            ],
            semanticDomains: [
              {
                name: "Universe",
                id: "1"
              }
            ],
            accessibility: State.active
          }
        ],
        audio: "",
        created: "",
        modified: "",
        history: [],
        partOfSpeech: "",
        editedBy: [],
        accessability: State.active,
        otherField: "",
        plural: ""
      },
      {
        id: "13",
        vernacular: "frontend",
        senses: [
          {
            glosses: [
              {
                language: "en",
                def: "javascript"
              }
            ],
            semanticDomains: [
              {
                name: "Universe",
                id: "1"
              }
            ],
            accessibility: State.active
          }
        ],
        audio: "",
        created: "",
        modified: "",
        history: [],
        partOfSpeech: "",
        editedBy: [],
        accessability: State.active,
        otherField: "",
        plural: ""
      }
    ];
    this.setState({ words: words });
  }

  /** Go back to the tree view */
  // Implement
  submit(e?: React.FormEvent<HTMLFormElement>, callback?: Function) {
    if (e) e.preventDefault();
  }

  async addNewWord(wordToAdd: Word) {
    await this.addWordToBackend(wordToAdd);
    let words: Word[] = await this.getWordsFromBackend();
    this.setState({ words: words });
    console.log(words);
  }

  async addWordToBackend(word: Word): Promise<Word> {
    let words = [...this.state.words];
    let wordId: number = parseInt(words[words.length - 1].id) + 1;
    word.id = wordId.toString();
    words.push(word);
    this.setState({ words: words });
    return word;
  }

  async getWordsFromBackend(): Promise<Word[]> {
    return [...this.state.words];
  }

  /** Update the word in the backend and the frontend. Implement. */
  async updateWord(wordToUpdate: Word) {
    console.log(wordToUpdate);
    let existingWord = this.state.words.find(
      word => word.id === wordToUpdate.id
    );
    console.log(existingWord);
    if (!existingWord)
      throw new Error("You are trying to update a nonexistent word");
    let index = this.state.words.indexOf(existingWord);
    if (!index) throw new Error(wordToUpdate + " does not exist");

    let updatedWord: Word = await this.updateWordInBackend(wordToUpdate);
    let updatedWords = await this.getWordsFromBackend();
    this.setState({ words: updatedWords });
    this.updateWordInFrontend(updatedWord, index);
  }

  async updateWordInBackend(word: Word): Promise<Word> {
    let returnedWord: Word = { ...word };
    let updatedId: number = parseInt(word.id) + 1;
    returnedWord.id = updatedId.toString();
    return returnedWord;
  }

  updateWordInFrontend(word: Word, index: number) {
    let words: Word[] = [...this.state.words];
    words.splice(index, 1, word);
    this.setState({ words: words });
  }

  /** Remove a word from the database. Implement */
  async removeWord(id: string) {
    let updatedWords: Word[] = this.state.words.filter(word => word.id !== id);
    this.setState({ words: updatedWords });
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
              allWords={this.state.words}
              entryIndex={index}
              entry={word}
              updateWord={this.updateWord}
              removeWord={this.removeWord}
            />
          ))}
          <NewEntry
            allWords={this.state.words}
            updateWord={this.updateWord}
            addNewWord={this.addNewWord}
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
