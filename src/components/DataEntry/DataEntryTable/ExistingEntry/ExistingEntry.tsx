import React from "react";
import { Grid } from "@material-ui/core";
import { Word, Gloss, Sense, State } from "../../../../types/word";
import DuplicateFinder from "../../../../goals/MergeDupGoal/DuplicateFinder/DuplicateFinder";
import ExistingVernEntry from "./ExistingVernacular/ExistingVernacular";
import ExistingGlossEntry from "./ExistingGloss/ExistingGloss";
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
  duplicateId?: string;
  duplicate?: Word;
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

/** If the venacular is in the frontier, returns that words id */
export function vernInFrontier(
  existingWords: Word[],
  vernacular: string
): string {
  let Finder = new DuplicateFinder();

  //[vernacular form, levenshtein distance]
  // the number defined here sets the upper bound on acceptable scores
  let foundDuplicate: [string, number] = ["", 2];

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
      if (levenD < foundDuplicate[1]) {
        foundDuplicate = [word.id, levenD];
      }
    }
  }

  return foundDuplicate[0];
}

export function isADuplicate(
  words: Word[],
  entry: Word,
  value: string
): boolean {
  let duplicateId = vernInFrontier(words, value);
  return duplicateId !== "" && duplicateId !== entry.id;
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
  constructor(props: ExistingEntryProps) {
    super(props);

    let isDuplicate: boolean = isADuplicate(
      this.props.existingWords,
      this.props.entry,
      this.props.entry.vernacular
    );
    let duplicateId: string | undefined;
    let duplicateWord: Word | undefined;
    if (isDuplicate) {
      duplicateId = vernInFrontier(
        this.props.existingWords,
        this.props.entry.vernacular
      );
      duplicateWord = this.props.existingWords.find(
        word => word.id === duplicateId
      );
    }

    this.state = {
      displaySpellingSuggestions: false,
      displayDuplicates: false,
      existingEntry: { ...this.props.entry },
      isSpelledCorrectly: true,
      isDuplicate: isDuplicate,
      duplicate: duplicateWord,
      duplicateId: duplicateId,
      hovering: false
    };
  }

  componentDidMount() {
    let isDuplicate: boolean = isADuplicate(
      this.props.existingWords,
      this.props.entry,
      this.props.entry.vernacular
    );
    let duplicateId: string | undefined;
    let duplicateWord: Word | undefined;
    if (isDuplicate) {
      duplicateId = vernInFrontier(
        this.props.existingWords,
        this.props.entry.vernacular
      );
      duplicateWord = this.props.existingWords.find(
        word => word.id === duplicateId
      );
    }

    this.setState({
      isDuplicate,
      duplicateId,
      duplicate: duplicateWord
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
    if (!this.state.duplicate) {
      return;
    }
    this.props.updateWord(updatedWord, this.props.entry);
    this.props.toggleDisplayDuplicates();
    this.setState({
      displayDuplicates: false,
      isDuplicate: false,
      duplicate: undefined,
      duplicateId: undefined
    });
  }

  addSemanticDomain(existingWord: Word, sense: Sense, index: number) {
    let updatedWord = addSemanticDomainToSense(
      this.props.semanticDomain,
      existingWord,
      sense,
      index
    );
    if (!this.state.duplicate) {
      return;
    }
    this.props.updateWord(updatedWord, this.props.entry);
    this.props.toggleDisplayDuplicates();
    this.setState({
      displayDuplicates: false,
      isDuplicate: false,
      duplicate: undefined,
      duplicateId: undefined
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
    let isDuplicate: boolean = isADuplicate(
      this.props.existingWords,
      this.props.entry,
      newValue
    );

    if (isDuplicate) {
      let duplicateId: string = vernInFrontier(
        this.props.existingWords,
        newValue
      );
      let duplicateWord: Word | undefined = this.props.existingWords.find(
        word => word.id === duplicateId
      );
      this.setState({
        isDuplicate: true,
        duplicateId: duplicateId ? duplicateId : undefined,
        duplicate: duplicateWord
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
            xs={5}
            style={{
              paddingLeft: theme.spacing(2),
              paddingRight: theme.spacing(2),
              position: "relative"
            }}
          >
            <ExistingVernEntry
              vernacular={this.state.existingEntry.vernacular}
              isDuplicate={this.state.isDuplicate}
              toggleDuplicateResolutionView={() =>
                this.toggleDuplicateResolutionView()
              }
              updateField={(newValue: string) => this.updateVernField(newValue)}
              updateWord={() => this.conditionallyUpdateWord()}
            />
          </Grid>
          <Grid
            item
            xs={5}
            style={{
              paddingLeft: theme.spacing(2),
              paddingRight: theme.spacing(2),
              position: "relative"
            }}
          >
            {" "}
            <ExistingGlossEntry
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
            xs={1}
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
          <Grid item xs={1}>
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
          this.state.duplicate && (
            <DuplicateResolutionView
              existingEntry={this.state.duplicate}
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
          )}
      </Grid>
    );
  }
}
