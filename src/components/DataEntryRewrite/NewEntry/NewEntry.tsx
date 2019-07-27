import React from "react";
import { Typography, Grid, Chip } from "@material-ui/core";
import theme from "../../../types/theme";

import { Word, Gloss, Sense, State } from "../../../types/word";
import * as Backend from "../../../backend";
import DuplicateFinder from "../../../goals/MergeDupGoal/DuplicateFinder/DuplicateFinder";
import SpellChecker from "../../DataEntry/spellChecker";
import NewVernEntry from "../NewEntry/NewVernEntry/NewVernEntry";
import NewGlossEntry from "../NewEntry/NewGlossEntry/NewGlossEntry";

interface NewEntryProps {
  allWords: Word[];
  updateWord: (updatedWord: Word) => void;
  addNewWord: (newWord: Word) => void;
}

interface NewEntryState {
  displaySpellingSuggestions: boolean;
  displayDuplicates: boolean;
  newEntry: Word;
  duplicateId?: string;
  duplicate?: Word;
  isSpelledCorrectly: boolean;
  isDuplicate: boolean;
}

export interface Entry {
  vernacular: string;
  glosses: string[];
}

export class NewEntry extends React.Component<NewEntryProps, NewEntryState> {
  constructor(props: NewEntryProps) {
    super(props);
    this.spellChecker = new SpellChecker();

    this.state = {
      displaySpellingSuggestions: false,
      displayDuplicates: false,
      newEntry: {
        id: "",
        vernacular: "",
        senses: [
          {
            glosses: [
              {
                language: "en",
                def: ""
              }
            ],
            semanticDomains: []
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
      isSpelledCorrectly: true,
      isDuplicate: false
    };

    this.toggleSpellingSuggestionsView = this.toggleSpellingSuggestionsView.bind(
      this
    );
    this.toggleDuplicateResolutionView = this.toggleDuplicateResolutionView.bind(
      this
    );
    this.updateGlossField = this.updateGlossField.bind(this);
    this.updateVernField = this.updateVernField.bind(this);
    this.isSpelledCorrectly = this.isSpelledCorrectly.bind(this);
  }

  spellChecker: SpellChecker;

  toggleSpellingSuggestionsView() {
    this.setState({
      displaySpellingSuggestions: !this.state.displaySpellingSuggestions
    });
  }

  toggleDuplicateResolutionView() {
    this.setState({ displayDuplicates: !this.state.displayDuplicates });
  }

  displaySpellingSuggestions(mispelledGloss: string) {
    let spellingSuggestions = this.getSpellingSuggestions(mispelledGloss);
    return (
      <Grid
        item
        xs={12}
        key={"mispelledNewEntry"}
        style={{ background: "whitesmoke" }}
      >
        <Grid container>
          <Grid
            item
            xs={5}
            style={{
              paddingLeft: theme.spacing(2),
              paddingRight: theme.spacing(2)
            }}
          >
            <Typography variant="body1">
              {"Mispelled gloss: " + mispelledGloss}
            </Typography>
          </Grid>
          <Grid
            item
            xs={5}
            style={{
              paddingLeft: theme.spacing(2),
              paddingRight: theme.spacing(2)
            }}
          >
            <Typography variant="body1">{"Suggestions: "}</Typography>
            {spellingSuggestions.length > 0 ? (
              spellingSuggestions.map(suggestion => (
                <Chip
                  label={suggestion}
                  style={{ margin: 4 }}
                  onClick={() => this.chooseSpellingSuggestion(suggestion)}
                />
              ))
            ) : (
              <Typography variant="body1">
                {"No suggestions available"}
              </Typography>
            )}
          </Grid>
        </Grid>
      </Grid>
    );
  }

  displayDuplicates(newEntry: Word, existingEntry: Word) {
    return (
      <Grid
        item
        xs={12}
        key={"duplicateNewVernEntry"}
        style={{ background: "whitesmoke" }}
      >
        <Grid container>
          <Grid
            item
            xs={5}
            style={{
              paddingLeft: theme.spacing(2),
              paddingRight: theme.spacing(2)
            }}
          >
            <Typography variant="body1">
              {"Duplicate in database: " + existingEntry.vernacular}
            </Typography>
          </Grid>
          <Grid
            item
            xs={5}
            style={{
              paddingLeft: theme.spacing(2),
              paddingRight: theme.spacing(2)
            }}
          >
            <Typography variant="body1">{"Glosses: "}</Typography>
            {existingEntry.senses.map((sense: Sense) =>
              sense.glosses.map(gloss => (
                <Chip label={gloss.def} style={{ margin: 4 }} />
              ))
            )}
            <Chip
              variant="outlined"
              label={"Add New Sense +"}
              style={{ margin: 4 }}
              onClick={() => {
                let updatedWord = this.addSenseToExistingWord(
                  existingEntry,
                  this.state.newEntry.senses[0].glosses[0].def
                );

                this.props.updateWord(updatedWord);
                this.setState({
                  displayDuplicates: false,
                  isDuplicate: false,
                  duplicate: undefined,
                  duplicateId: undefined
                });
              }}
            />
          </Grid>
        </Grid>
      </Grid>
    );
  }

  chooseSpellingSuggestion(suggestion: string) {
    this.setState({
      newEntry: {
        ...this.state.newEntry,
        senses: [
          {
            glosses: [
              {
                language: "en",
                def: suggestion
              }
            ],
            semanticDomains: []
          }
        ]
      },
      isSpelledCorrectly: true,
      displaySpellingSuggestions: false
    });
  }

  addSenseToExistingWord(existingWord: Word, newSense: string): Word {
    let updatedWord: Word = {
      ...existingWord
    };

    let newGloss: Gloss = {
      language: "en",
      def: newSense
    };

    updatedWord.senses[0].glosses.push(newGloss); // Fix which sense we are adding to
    return updatedWord;
  }

  updateGlossField(newValue: string) {
    let isSpelledCorrectly =
      newValue.trim() !== "" ? this.isSpelledCorrectly(newValue) : true;
    this.setState({
      isSpelledCorrectly: isSpelledCorrectly,
      newEntry: {
        ...this.state.newEntry,
        senses: [
          { glosses: [{ language: "en", def: newValue }], semanticDomains: [] }
        ]
      },
      displaySpellingSuggestions:
        this.state.displaySpellingSuggestions && isSpelledCorrectly
          ? false
          : this.state.displaySpellingSuggestions
    });
  }

  updateVernField(newValue: string) {
    let duplicateId: string = this.vernInFrontier(newValue);
    let isDuplicate: boolean = duplicateId !== "";
    this.setState({
      isDuplicate: isDuplicate,
      duplicate: duplicateId ? this.getDuplicate(duplicateId) : undefined,
      newEntry: {
        ...this.state.newEntry,
        vernacular: newValue
      },
      duplicateId: duplicateId ? duplicateId : undefined,
      displayDuplicates:
        this.state.displayDuplicates && isDuplicate
          ? this.state.displayDuplicates
          : false
    });
  }

  /** If the venacular is in the frontier, returns that words id */
  vernInFrontier(vernacular: string): string {
    let Finder = new DuplicateFinder();

    //[vernacular form, levenshtein distance]
    // the number defined here sets the upper bound on acceptable scores
    let foundDuplicate: [string, number] = ["", 2];

    for (let word of this.props.allWords) {
      let accessible = false;
      for (let sense of word.senses) {
        if (sense.accessibility === 0) {
          accessible = true;
          break;
        }
      }
      if (accessible) {
        let levenD: number = Finder.getLevenshteinDistance(
          vernacular,
          word.vernacular
        );
        if (levenD < foundDuplicate[1]) {
          foundDuplicate = [word.id, levenD];
        }
      }
    }

    return foundDuplicate[0];
  }

  getDuplicate(id: string): Word {
    let word = this.props.allWords.find(word => word.id === id);
    if (!word) throw new Error("No word exists with this id");
    return word;
  }

  isSpelledCorrectly(word: string): boolean {
    return this.spellChecker.correct(word);
  }

  getSpellingSuggestions(word: string): string[] {
    return this.spellChecker.getSpellingSuggestions(word);
  }

  resetState() {
    this.setState({
      displaySpellingSuggestions: false,
      displayDuplicates: false,
      newEntry: {
        id: "",
        vernacular: "",
        senses: [
          {
            glosses: [
              {
                language: "en",
                def: ""
              }
            ],
            semanticDomains: []
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
      isSpelledCorrectly: true,
      isDuplicate: false
    });
  }

  render() {
    return (
      <React.Fragment>
        <Grid item xs={12}>
          <Grid
            container
            onKeyDown={e => {
              if (e.key === "Enter") {
                this.props.addNewWord(this.state.newEntry);
                this.resetState();
              }
            }}
          >
            <NewVernEntry
              vernacular={this.state.newEntry.vernacular}
              isDuplicate={this.state.isDuplicate}
              toggleDuplicateResolutionView={this.toggleDuplicateResolutionView}
              updateVernField={this.updateVernField}
            />
            <NewGlossEntry
              glosses={this.state.newEntry.senses[0].glosses[0].def}
              isSpelledCorrectly={this.state.isSpelledCorrectly}
              toggleSpellingSuggestionsView={this.toggleSpellingSuggestionsView}
              updateGlossField={this.updateGlossField}
            />
            {this.state.displaySpellingSuggestions &&
              this.displaySpellingSuggestions(
                this.state.newEntry.senses[0].glosses[0].def
              )}
            {this.state.displayDuplicates &&
              this.state.isDuplicate &&
              this.state.duplicate &&
              this.displayDuplicates(this.state.newEntry, this.state.duplicate)}
          </Grid>
        </Grid>
      </React.Fragment>
    );
  }
}
