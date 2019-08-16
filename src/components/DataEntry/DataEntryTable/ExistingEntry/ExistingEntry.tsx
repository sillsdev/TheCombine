import React from "react";
import { Grid } from "@material-ui/core";
import { Word, Gloss, Sense, State } from "../../../../types/word";
import DuplicateFinder from "../../../../goals/MergeDupGoal/DuplicateFinder/DuplicateFinder";
import ExistingVernacular from "./ExistingVernacular/ExistingVernacular";
import ExistingGloss from "./ExistingGloss/ExistingGloss";
import { SpellingSuggestionsView } from "../SpellingSuggestions/SpellingSuggestions";
import { DuplicateResolutionView } from "../DuplicateResolutionView/DuplicateResolutionView";
import { SemanticDomain } from "../../../../types/word";
import DeleteEntry from "./DeleteEntry/DeleteEntry";
import SpellChecker from "../../spellChecker";
import theme from "../../../../types/theme";
import PronunciationsComponent from "../../../Pronunciations/PronunciationsComponent";
import { Recorder } from "../../../Pronunciations/Recorder";

interface ExistingEntryProps {
  wordsBeingAdded: Word[];
  existingWords: Word[];
  entryIndex: number;
  entry: Word;
  updateWord: (wordToUpdate: Word, wordToDelete?: Word) => void;
  removeWord: (word: Word) => void;
  spellChecker: SpellChecker;
  semanticDomain: SemanticDomain;
  displayDuplicates: boolean;
  toggleDisplayDuplicates: () => void;
  displaySpellingSuggestions: boolean;
  toggleDisplaySpellingSuggestions: () => void;
  recorder: Recorder;
}

interface ExistingEntryState {
  displaySpellingSuggestions: boolean;
  displayDuplicates: boolean;
  existingEntry: Word;
  duplicateIds?: string[];
  duplicates?: Word[];
  isSpelledCorrectly: boolean;
  isDuplicate: boolean;
  hovering: boolean;
}

export function addSenseToWord(
  semanticDomain: SemanticDomain,
  existingWord: Word,
  gloss: string
): Word {
  let updatedWord = { ...existingWord };

  let newGloss: Gloss = {
    language: "en",
    def: gloss
  };

  let newSense: Sense = {
    glosses: [newGloss],
    semanticDomains: [semanticDomain],
    accessibility: State.active
  };

  updatedWord.senses.push(newSense); // Fix which sense we are adding to
  return updatedWord;
}

export function addSemanticDomainToSense(
  semanticDomain: SemanticDomain,
  existingWord: Word,
  sense: Sense,
  index: number
): Word {
  let updatedWord = { ...existingWord };
  let newSense: Sense = {
    ...sense,
    semanticDomains: [...sense.semanticDomains, semanticDomain]
  };

  let senses = existingWord.senses;
  let updatedSenses: Sense[] = updateSenses(senses, newSense, index);

  updatedWord.senses = updatedSenses;
  return updatedWord;
}

function updateSenses(
  senses: Sense[],
  senseToUpdate: Sense,
  index: number
): Sense[] {
  let updatedSenses: Sense[] = [...senses];
  updatedSenses.splice(index, 1, senseToUpdate);
  return updatedSenses;
}

export function duplicatesFromFrontier(
  existingWords: Word[],
  vernacular: string,
  maximum: number,
  entryToExclude?: string
): string[] {
  let Finder = new DuplicateFinder();

  var duplicateWords: [string, number][] = [];
  for (let word of existingWords) {
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
      // 2 here is the maximum acceptable score
      if (
        levenD < 2 &&
        (entryToExclude === undefined || word.id != entryToExclude)
      ) {
        duplicateWords.push([word.id, levenD]);
      }
    }
  }

  let sorted = duplicateWords.sort((a, b) => a[1] - b[1]);
  sorted.length = Math.min(duplicateWords.length, maximum);
  return sorted.map(item => item[0]);
}

// extract, or remove altogether
function wordsAreEqual(a: Word, b: Word): boolean {
  return (
    a.vernacular === b.vernacular &&
    a.senses[0].glosses[0].def === b.senses[0].glosses[0].def
  );
}

/**
 * Displays a word a user can still make edits to
 */
export class ExistingEntry extends React.Component<
  ExistingEntryProps,
  ExistingEntryState
> {
  readonly maxDuplicates: number = 5;
  constructor(props: ExistingEntryProps) {
    super(props);

    let possibleDups = duplicatesFromFrontier(
      this.props.existingWords,
      this.props.entry.vernacular,
      this.maxDuplicates,
      props.entry.id
    );
    let isDuplicate: boolean = possibleDups.length > 0;
    let duplicateWords: Word[] | undefined;
    if (isDuplicate) {
      duplicateWords = this.props.existingWords.filter(word =>
        possibleDups.includes(word.id)
      );
    }

    this.state = {
      displaySpellingSuggestions: false,
      displayDuplicates: false,
      existingEntry: { ...this.props.entry },
      isSpelledCorrectly: true,
      isDuplicate: isDuplicate,
      duplicates: duplicateWords,
      duplicateIds: possibleDups,
      hovering: false
    };
  }

  componentDidMount() {
    let possibleDups = duplicatesFromFrontier(
      this.props.existingWords,
      this.props.entry.vernacular,
      this.maxDuplicates,
      this.props.entry.id
    );
    let isDuplicate: boolean = possibleDups.length > 0;
    let duplicateIds: string[] | undefined;
    let duplicateWords: Word[] | undefined;
    if (isDuplicate) {
      duplicateIds = possibleDups;
      duplicateWords = this.props.existingWords.filter(word =>
        duplicateIds!.includes(word.id)
      );
    }

    this.setState({
      isDuplicate,
      duplicateIds,
      duplicates: duplicateWords
    });
  }

  toggleSpellingSuggestionsView() {
    this.props.toggleDisplaySpellingSuggestions();
  }

  toggleDuplicateResolutionView() {
    this.props.toggleDisplayDuplicates();
  }

  chooseSpellingSuggestion(suggestion: string) {
    let updatedWord: Word = { ...this.props.entry };
    updatedWord.senses[0].glosses[0].def = suggestion; // Newly entered words only have one sense

    this.props.updateWord(updatedWord);
    this.props.toggleDisplaySpellingSuggestions();
    this.setState({
      isSpelledCorrectly: true,
      displaySpellingSuggestions: false,
      existingEntry: {
        ...this.state.existingEntry,
        senses: [
          {
            ...this.state.existingEntry.senses[0],
            glosses: [
              {
                language: "en",
                def: suggestion
              }
            ]
          }
        ]
      }
    });
  }

  addNewSense(existingWord: Word, newSense: string) {
    let updatedWord = addSenseToWord(
      this.props.semanticDomain,
      existingWord,
      newSense
    );
    if (!this.state.duplicates) {
      return;
    }
    this.props.updateWord(updatedWord, this.props.entry);
    this.props.toggleDisplayDuplicates();
    this.setState({
      displayDuplicates: false,
      isDuplicate: false,
      duplicates: undefined,
      duplicateIds: undefined
    });
  }

  addSemanticDomain(existingWord: Word, sense: Sense, index: number) {
    let updatedWord = addSemanticDomainToSense(
      this.props.semanticDomain,
      existingWord,
      sense,
      index
    );
    if (!this.state.duplicates) {
      return;
    }
    this.props.updateWord(updatedWord, this.props.entry);
    this.props.toggleDisplayDuplicates();
    this.setState({
      displayDuplicates: false,
      isDuplicate: false,
      duplicates: undefined,
      duplicateIds: undefined
    });
  }

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

  updateVernField(newValue: string) {
    let possibleDups = duplicatesFromFrontier(
      this.props.existingWords,
      newValue,
      this.maxDuplicates,
      this.props.entry.id
    );
    let isDuplicate: boolean = possibleDups.length > 0;

    if (isDuplicate) {
      let duplicateWords: Word[] | undefined = this.props.existingWords.filter(
        word => possibleDups.includes(word.id)
      );
      this.setState({
        isDuplicate: true,
        duplicateIds: possibleDups,
        duplicates: duplicateWords
      });
    }
    this.setState({
      existingEntry: {
        ...this.state.existingEntry,
        vernacular: newValue
      },
      displayDuplicates:
        this.state.displayDuplicates && isDuplicate
          ? this.state.displayDuplicates
          : false
    });
  }

  isSpelledCorrectly(word: string): boolean {
    return this.props.spellChecker.correct(word);
  }

  getSpellingSuggestions(word: string): string[] {
    return this.props.spellChecker.getSpellingSuggestions(word);
  }

  removeWord(word: Word, callback?: Function) {
    this.props.removeWord(word);
  }

  removeEntry() {
    this.removeWord(this.props.entry);
  }

  conditionallyUpdateWord() {
    if (!wordsAreEqual(this.props.entry, this.state.existingEntry)) {
      this.props.updateWord(this.state.existingEntry);
    }
  }

  render() {
    return (
      <Grid item xs={12} key={this.props.entryIndex}>
        <Grid
          container
          onMouseEnter={() => this.setState({ hovering: true })}
          onMouseLeave={() => this.setState({ hovering: false })}
        >
          <Grid
            item
            xs={4}
            style={{
              paddingLeft: theme.spacing(2),
              paddingRight: theme.spacing(2),
              position: "relative"
            }}
          >
            <ExistingVernacular
              vernacular={this.state.existingEntry.vernacular}
              isDuplicate={
                this.state.displayDuplicates && this.state.isDuplicate
              }
              toggleDuplicateResolutionView={() =>
                this.toggleDuplicateResolutionView()
              }
              updateField={(newValue: string) => this.updateVernField(newValue)}
              updateWord={() => this.conditionallyUpdateWord()}
            />
          </Grid>
          <Grid
            item
            xs={4}
            style={{
              paddingLeft: theme.spacing(2),
              paddingRight: theme.spacing(2),
              position: "relative"
            }}
          >
            <ExistingGloss
              glosses={
                this.state.existingEntry.senses &&
                this.state.existingEntry.senses[0] &&
                this.state.existingEntry.senses[0].glosses &&
                this.state.existingEntry.senses[0].glosses[0]
                  ? this.state.existingEntry.senses[0].glosses[0].def
                  : ""
              }
              isSpelledCorrectly={this.state.isSpelledCorrectly}
              toggleSpellingSuggestionsView={() =>
                this.toggleSpellingSuggestionsView()
              }
              updateGlossField={(newValue: string) =>
                this.updateGlossField(newValue)
              }
            />
          </Grid>
          <Grid
            item
            xs={3}
            style={{
              paddingLeft: theme.spacing(2),
              paddingRight: theme.spacing(2),
              position: "relative"
            }}
          >
            <PronunciationsComponent
              wordId={this.state.existingEntry.id}
              recorder={this.props.recorder}
              pronunciationFiles={this.state.existingEntry.audio}
              //TODO: wordUpdated={wordupdatemethod}
            />
          </Grid>
          <Grid
            item
            xs={1}
            style={{
              paddingLeft: theme.spacing(1),
              paddingRight: theme.spacing(1),
              position: "relative"
            }}
          >
            {this.state.hovering && (
              <DeleteEntry
                entryIndex={this.props.entryIndex}
                removeEntry={() => this.removeEntry()}
              />
            )}
          </Grid>
        </Grid>
        {this.props.displaySpellingSuggestions && (
          <SpellingSuggestionsView
            mispelledWord={
              this.state.existingEntry.senses &&
              this.state.existingEntry.senses[0] &&
              this.state.existingEntry.senses[0].glosses &&
              this.state.existingEntry.senses[0].glosses[0]
                ? this.state.existingEntry.senses[0].glosses[0].def
                : ""
            }
            spellingSuggestions={this.getSpellingSuggestions(
              this.state.existingEntry.senses &&
                this.state.existingEntry.senses[0] &&
                this.state.existingEntry.senses[0].glosses &&
                this.state.existingEntry.senses[0].glosses[0]
                ? this.state.existingEntry.senses[0].glosses[0].def
                : ""
            )}
            chooseSpellingSuggestion={(suggestion: string) =>
              this.chooseSpellingSuggestion(suggestion)
            }
          />
        )}
        {this.props.displayDuplicates &&
          this.state.isDuplicate &&
          this.state.duplicates &&
          this.state.duplicates.map(duplicate => (
            <DuplicateResolutionView
              existingEntry={duplicate}
              newSense={
                this.state.existingEntry.senses &&
                this.state.existingEntry.senses[0] &&
                this.state.existingEntry.senses[0].glosses &&
                this.state.existingEntry.senses[0].glosses[0]
                  ? this.state.existingEntry.senses[0].glosses[0].def
                  : ""
              }
              addSense={(existingWord: Word, newSense: string) =>
                this.addNewSense(existingWord, newSense)
              }
              addSemanticDomain={(
                existingWord: Word,
                sense: Sense,
                index: number
              ) => this.addSemanticDomain(existingWord, sense, index)}
            />
          ))}
      </Grid>
    );
  }
}
