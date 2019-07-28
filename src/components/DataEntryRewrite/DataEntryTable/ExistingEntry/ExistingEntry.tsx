import React from "react";
import { Typography, Grid, Chip } from "@material-ui/core";
import theme from "../../../../types/theme";
import { Word, Sense, Gloss } from "../../../../types/word";
import * as Backend from "../../../../backend";
import DuplicateFinder from "../../../../goals/MergeDupGoal/DuplicateFinder/DuplicateFinder";
import SpellChecker from "../../../DataEntry/spellChecker";
import ExistingVernEntry from "./ExistingVernEntry/ExistingVernEntry";
import ExistingGlossEntry from "./ExistingGlossEntry/ExistingGlossEntry";
import DeleteEntry from "./DeleteEntry/DeleteEntry";

interface ExistingEntryProps {
  allWords: Word[];
  entryIndex: number;
  entry: Word;
  updateWord: (updatedWord: Word) => void;
  removeWord: (id: string) => void;
}

// Almost the same
interface ExistingEntryState {
  displaySpellingSuggestions: boolean;
  displayDuplicates: boolean;
  existingEntry: Word;
  duplicateId?: string;
  duplicate?: Word;
  isSpelledCorrectly: boolean;
  isDuplicate: boolean;
  hovering: boolean;
}

export class ExistingEntry extends React.Component<
  ExistingEntryProps,
  ExistingEntryState
> {
  constructor(props: ExistingEntryProps) {
    super(props);
    this.spellChecker = new SpellChecker();

    this.state = {
      displaySpellingSuggestions: false,
      displayDuplicates: false,
      existingEntry: { ...this.props.entry },
      isSpelledCorrectly: true,
      isDuplicate: false,
      hovering: false
    };

    this.updateGlossField = this.updateGlossField.bind(this);
    this.updateVernField = this.updateVernField.bind(this);
    this.toggleSpellingSuggestionsView = this.toggleSpellingSuggestionsView.bind(
      this
    );
    this.toggleDuplicateResolutionView = this.toggleDuplicateResolutionView.bind(
      this
    );
    this.removeEntry = this.removeEntry.bind(this);
    this.conditionallyUpdateWord = this.conditionallyUpdateWord.bind(this);
  }

  spellChecker: SpellChecker;

  // Same
  toggleSpellingSuggestionsView() {
    this.setState({
      displaySpellingSuggestions: !this.state.displaySpellingSuggestions
    });
  }

  // Same
  toggleDuplicateResolutionView() {
    this.setState({ displayDuplicates: !this.state.displayDuplicates });
  }

  // Same
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

  // Almost the same
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
                  this.state.existingEntry.senses[0].glosses[0].def
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

  // Almost the same
  chooseSpellingSuggestion(suggestion: string) {
    let updatedWord = { ...this.props.entry };
    updatedWord.senses[0].glosses[0].def = suggestion;

    this.props.updateWord(updatedWord);

    this.setState({
      isSpelledCorrectly: true,
      displaySpellingSuggestions: false,
      existingEntry: {
        ...this.state.existingEntry,
        senses: [
          {
            glosses: [
              {
                language: "en",
                def: suggestion /*this.props.entry.senses[0].glosses[0].def*/
              }
            ],
            semanticDomains: []
          }
        ]
      }
    });
  }

  // Same
  // Move out of class
  addSenseToExistingWord(existingWord: Word, newSense: string): Word {
    let updatedWord = { ...existingWord };

    let newGloss: Gloss = {
      language: "en",
      def: newSense
    };

    updatedWord.senses[0].glosses.push(newGloss); // Fix which sense we are adding to
    return updatedWord;
  }

  // Same
  updateGlossField(newValue: string) {
    let isSpelledCorrectly =
      newValue.trim() !== "" ? this.isSpelledCorrectly(newValue) : true;
    this.setState({
      isSpelledCorrectly: isSpelledCorrectly,
      existingEntry: {
        ...this.state.existingEntry,
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

  // Same
  updateVernField(newValue: string) {
    let duplicateId: string = this.vernInFrontier(newValue);
    let isDuplicate: boolean = duplicateId !== "";
    this.setState({
      isDuplicate: isDuplicate,
      duplicate: duplicateId ? this.getDuplicate(duplicateId) : undefined,
      existingEntry: {
        ...this.state.existingEntry,
        vernacular: newValue
      },
      duplicateId: duplicateId ? duplicateId : undefined,
      displayDuplicates:
        this.state.displayDuplicates && isDuplicate
          ? this.state.displayDuplicates
          : false
    });
  }

  // Same
  // Maybe move out of class
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

  // Same
  // Maybe move out of class
  getDuplicate(id: string): Word {
    let word = this.props.allWords.find(word => word.id === id);
    if (!word) throw new Error("No word exists with this id");
    return word;
  }

  // Same
  // Move out of class
  isSpelledCorrectly(word: string): boolean {
    return this.spellChecker.correct(word);
  }

  // Same
  // Move out of class
  getSpellingSuggestions(word: string): string[] {
    return this.spellChecker.getSpellingSuggestions(word);
  }

  removeWord(id: string, callback?: Function) {
    this.props.removeWord(id);
  }

  removeEntry() {
    this.removeWord(this.props.entry.id);
  }

  conditionallyUpdateWord() {
    if (!this.wordsAreEqual(this.props.entry, this.state.existingEntry)) {
      this.props.updateWord(this.state.existingEntry);
    }
  }

  // Move out of class
  wordsAreEqual(a: Word, b: Word): boolean {
    let areEqual: boolean = false;

    areEqual = a.vernacular === b.vernacular;
    areEqual =
      areEqual && a.senses[0].glosses[0].def === b.senses[0].glosses[0].def;

    return areEqual;
  }

  render() {
    return (
      <Grid
        item
        xs={12}
        key={this.props.entryIndex}
        onMouseEnter={() => {
          this.setState({ hovering: true });
        }}
        onMouseLeave={() => {
          this.setState({ hovering: false });
        }}
      >
        <Grid container>
          <ExistingVernEntry
            vernacular={this.state.existingEntry.vernacular}
            isDuplicate={this.state.isDuplicate}
            toggleDuplicateResolutionView={this.toggleDuplicateResolutionView}
            updateField={this.updateVernField}
            updateWord={this.conditionallyUpdateWord}
          />
          <ExistingGlossEntry
            glosses={this.state.existingEntry.senses[0].glosses[0].def}
            isSpelledCorrectly={this.state.isSpelledCorrectly}
            toggleSpellingSuggestionsView={this.toggleSpellingSuggestionsView}
            updateGlossField={this.updateGlossField}
          />
          <Grid item xs={2}>
            {this.state.hovering && (
              <DeleteEntry
                entryIndex={this.props.entryIndex}
                removeEntry={this.removeEntry}
              />
            )}
          </Grid>
        </Grid>
        {this.state.displaySpellingSuggestions &&
          this.displaySpellingSuggestions(
            this.state.existingEntry.senses[0].glosses[0].def
          )}
        {this.state.displayDuplicates &&
          this.state.isDuplicate &&
          this.state.duplicate &&
          this.displayDuplicates(
            this.state.existingEntry,
            this.state.duplicate
          )}
      </Grid>
    );
  }
}
