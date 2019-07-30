import React from "react";
import { Grid } from "@material-ui/core";
import { Word, Gloss, Sense, State } from "../../../../types/word";
import DuplicateFinder from "../../../../goals/MergeDupGoal/DuplicateFinder/DuplicateFinder";
import SpellChecker from "../../../DataEntry/spellChecker";
import ExistingVernEntry from "./ExistingVernEntry/ExistingVernEntry";
import ExistingGlossEntry from "./ExistingGlossEntry/ExistingGlossEntry";
import DeleteEntry from "./DeleteEntry/DeleteEntry";
import { SpellingSuggestionsView } from "../SpellingSuggestions/SpellingSuggestions";
import { DuplicateResolutionView } from "../DuplicateResolutionView/DuplicateResolutionView";
import { SemanticDomain } from "../../../../types/word";

interface ExistingEntryProps {
  wordsBeingAdded: Word[];
  existingWords: Word[];
  entryIndex: number;
  entry: Word;
  updateWord: (updatedWord: Word, shouldBeMutable?: boolean) => void;
  // removeWord: (id: string) => void;
  spellChecker: SpellChecker;
  semanticDomain: SemanticDomain;
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
  // hovering: boolean;
}

export class ExistingEntry extends React.Component<
  ExistingEntryProps,
  ExistingEntryState
> {
  constructor(props: ExistingEntryProps) {
    super(props);

    this.state = {
      displaySpellingSuggestions: false,
      displayDuplicates: false,
      existingEntry: { ...this.props.entry },
      isSpelledCorrectly: true,
      isDuplicate: false
      // hovering: false
    };

    this.updateGlossField = this.updateGlossField.bind(this);
    this.updateVernField = this.updateVernField.bind(this);
    this.toggleSpellingSuggestionsView = this.toggleSpellingSuggestionsView.bind(
      this
    );
    this.toggleDuplicateResolutionView = this.toggleDuplicateResolutionView.bind(
      this
    );
    this.chooseSpellingSuggestion = this.chooseSpellingSuggestion.bind(this);
    this.addNewSense = this.addNewSense.bind(this);
    this.removeEntry = this.removeEntry.bind(this);
    this.conditionallyUpdateWord = this.conditionallyUpdateWord.bind(this);
    this.addSemanticDomain = this.addSemanticDomain.bind(this);
  }

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

  // Almost the same
  chooseSpellingSuggestion(suggestion: string) {
    let updatedWord: Word = { ...this.props.entry };
    updatedWord.senses[0].glosses[0].def = suggestion; // Should work because we are only allowed to change the spellings of brand new words

    this.props.updateWord(updatedWord, true);

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
    let updatedWord = this.addSenseToExistingWord(existingWord, newSense);
    this.props.updateWord(updatedWord, false);
    this.setState({
      displayDuplicates: false,
      isDuplicate: false,
      duplicate: undefined,
      duplicateId: undefined
    });
  }

  addSemanticDomain(existingWord: Word, sense: Sense) {
    let updatedWord = this.addSemanticDomainToSense(existingWord, sense);
    this.props.updateWord(updatedWord, false);
    this.setState({
      displayDuplicates: false,
      isDuplicate: false,
      duplicate: undefined,
      duplicateId: undefined
    });
  }

  // Same
  addSenseToExistingWord(existingWord: Word, gloss: string): Word {
    let updatedWord = { ...existingWord };

    let newGloss: Gloss = {
      language: "en",
      def: gloss
    };

    let newSense: Sense = {
      glosses: [newGloss],
      semanticDomains: [this.props.semanticDomain],
      accessibility: State.active
    };

    updatedWord.senses.push(newSense); // Fix which sense we are adding to
    return updatedWord;
  }

  addSemanticDomainToSense(existingWord: Word, sense: Sense): Word {
    let updatedWord = { ...existingWord };

    let newSense: Sense = {
      ...sense,
      semanticDomains: [this.props.semanticDomain]
    };

    let index = this.getIndexOfSenseInWord(existingWord, sense);
    let senses = existingWord.senses;
    let updatedSenses: Sense[] = this.updateSenses(senses, newSense, index);

    updatedWord.senses = updatedSenses;
    return updatedWord;
  }

  private getIndexOfSenseInWord(word: Word, sense: Sense): number {
    let index = 0;
    for (const [i, currentSense] of word.senses.entries()) {
      if (this.areSensesEqual(currentSense, sense)) {
        index = i;
        break;
      }
    }
    return index;
  }

  private areSensesEqual(a: Sense, b: Sense): boolean {
    for (const [index, gloss] of a.glosses.entries()) {
      if (gloss.def != b.glosses[index].def) {
        return false;
      }
      if (gloss.language != b.glosses[index].def) {
        return false;
      }
    }

    for (const [index, semanticDomain] of a.semanticDomains.entries()) {
      if (semanticDomain.id != b.semanticDomains[index].id) {
        return false;
      }

      if (semanticDomain.name != b.semanticDomains[index].name) {
        return false;
      }
    }

    if (a.accessibility && b.accessibility) {
      if (a.accessibility !== b.accessibility) {
        return false;
      }
    } else {
      return false;
    }
    return true;
  }

  updateSenses(senses: Sense[], senseToUpdate: Sense, index: number): Sense[] {
    let updatedSenses: Sense[] = [...senses];
    updatedSenses.splice(index, 1, senseToUpdate);
    return updatedSenses;
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
  // Move out of class
  /** If the venacular is in the frontier, returns that words id */
  vernInFrontier(vernacular: string): string {
    let Finder = new DuplicateFinder();

    //[vernacular form, levenshtein distance]
    // the number defined here sets the upper bound on acceptable scores
    let foundDuplicate: [string, number] = ["", 2];

    for (let word of this.props.existingWords) {
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
  // Move out of class
  getDuplicate(id: string): Word {
    let word = this.props.wordsBeingAdded.find(word => word.id === id);
    if (!word) throw new Error("No word exists with this id");
    return word;
  }

  // Same
  // Move out of class
  isSpelledCorrectly(word: string): boolean {
    return this.props.spellChecker.correct(word);
  }

  // Same
  // Move out of class
  getSpellingSuggestions(word: string): string[] {
    return this.props.spellChecker.getSpellingSuggestions(word);
  }

  removeWord(id: string, callback?: Function) {
    // this.props.removeWord(id);
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
          // this.setState({ hovering: true });
        }}
        onMouseLeave={() => {
          // this.setState({ hovering: false });
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
          {/* <Grid item xs={2}>
            {this.state.hovering && (
              <DeleteEntry
                entryIndex={this.props.entryIndex}
                removeEntry={this.removeEntry}
              />
            )}
          </Grid> */}
        </Grid>
        {this.state.displaySpellingSuggestions && (
          <SpellingSuggestionsView
            mispelledWord={this.state.existingEntry.senses[0].glosses[0].def}
            spellingSuggestions={this.getSpellingSuggestions(
              this.state.existingEntry.senses[0].glosses[0].def
            )}
            chooseSpellingSuggestion={this.chooseSpellingSuggestion}
          />
        )}
        {this.state.displayDuplicates &&
          this.state.isDuplicate &&
          this.state.duplicate && (
            <DuplicateResolutionView
              existingEntry={this.state.duplicate}
              newSense={this.state.existingEntry.senses[0].glosses[0].def}
              addSense={this.addNewSense}
              addSemanticDomain={this.addSemanticDomain}
            />
          )}
      </Grid>
    );
  }
}
