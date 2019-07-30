import React from "react";
import { Grid } from "@material-ui/core";
import {
  Word,
  Gloss,
  State,
  Sense,
  SemanticDomain
} from "../../../../types/word";
import DuplicateFinder from "../../../../goals/MergeDupGoal/DuplicateFinder/DuplicateFinder";
import SpellChecker from "../../spellChecker";
import NewVernEntry from "./NewVernEntry/NewVernEntry";
import NewGlossEntry from "./NewGlossEntry/NewGlossEntry";
import { SpellingSuggestionsView } from "../SpellingSuggestions/SpellingSuggestions";
import { DuplicateResolutionView } from "../DuplicateResolutionView/DuplicateResolutionView";

interface NewEntryProps {
  allWords: Word[];
  updateWord: (updatedWord: Word, shouldBeMutable?: boolean) => void;
  addNewWord: (newWord: Word) => void;
  spellChecker: SpellChecker;
  semanticDomain: SemanticDomain;
  displayDuplicates: boolean;
  toggleDisplayDuplicates: () => void;
  displaySpellingSuggestions: boolean;
  toggleDisplaySpellingSuggestions: () => void;
}

interface NewEntryState {
  newEntry: Word;
  duplicate?: Word;
  isSpelledCorrectly: boolean;
  isDuplicate: boolean;
}

export class NewEntry extends React.Component<NewEntryProps, NewEntryState> {
  constructor(props: NewEntryProps) {
    super(props);

    this.state = {
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
            semanticDomains: [this.props.semanticDomain]
          }
        ],
        audio: [],
        created: "",
        modified: "",
        history: [],
        partOfSpeech: "",
        editedBy: [],
        otherField: "",
        plural: ""
      },
      isSpelledCorrectly: true,
      isDuplicate: false
    };

    this.vernInput = React.createRef<HTMLDivElement>();
    this.glossInput = React.createRef<HTMLDivElement>();
  }

  vernInput: React.RefObject<HTMLDivElement>;
  glossInput: React.RefObject<HTMLDivElement>;

  toggleSpellingSuggestionsView() {
    this.props.toggleDisplaySpellingSuggestions();
  }

  toggleDuplicateResolutionView() {
    this.props.toggleDisplayDuplicates();
  }

  resetEntry() {
    this.setState({
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
            semanticDomains: [this.props.semanticDomain]
          }
        ],
        audio: [],
        created: "",
        modified: "",
        history: [],
        partOfSpeech: "",
        editedBy: [],
        otherField: "",
        plural: ""
      }
    });
  }

  chooseSpellingSuggestion(suggestion: string) {
    this.props.toggleDisplaySpellingSuggestions();
    this.setState({
      isSpelledCorrectly: true,
      newEntry: {
        ...this.state.newEntry,
        senses: [
          {
            ...this.state.newEntry.senses[0], // Newly entered words only have one sense
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
    this.props.toggleDisplayDuplicates();
    this.resetEntry();
    this.setState({
      isDuplicate: false,
      duplicate: undefined
    });
  }

  addSemanticDomain(existingWord: Word, sense: Sense, index: number) {
    let updatedWord = this.addSemanticDomainToSense(existingWord, sense, index);
    this.props.updateWord(updatedWord, false);
    this.props.toggleDisplayDuplicates();
    this.resetEntry();
    this.setState({
      isDuplicate: false,
      duplicate: undefined
    });
  }

  addSenseToExistingWord(existingWord: Word, sense: string): Word {
    let updatedWord = { ...existingWord };

    let newGloss: Gloss = {
      language: "en",
      def: sense
    };

    let newSense: Sense = {
      glosses: [newGloss],
      semanticDomains: [this.props.semanticDomain],
      accessibility: State.active
    };

    updatedWord.senses.push(newSense); // Fix which sense we are adding to
    return updatedWord;
  }

  addSemanticDomainToSense(
    existingWord: Word,
    sense: Sense,
    index: number
  ): Word {
    let updatedWord = { ...existingWord };

    let newSense: Sense = {
      ...sense,
      semanticDomains: [this.props.semanticDomain]
    };

    let senses = existingWord.senses;
    let updatedSenses: Sense[] = this.updateSenses(senses, newSense, index);

    updatedWord.senses = updatedSenses;
    return updatedWord;
  }

  updateSenses(senses: Sense[], senseToUpdate: Sense, index: number): Sense[] {
    let updatedSenses: Sense[] = [...senses];
    updatedSenses.splice(index, 1, senseToUpdate);
    return updatedSenses;
  }

  updateGlossField(newValue: string) {
    let isSpelledCorrectly =
      newValue.trim() !== "" ? this.isSpelledCorrectly(newValue) : true;
    this.setState({
      isSpelledCorrectly: isSpelledCorrectly,
      newEntry: {
        ...this.state.newEntry,
        senses: [
          {
            glosses: [{ language: "en", def: newValue }],
            semanticDomains: [this.props.semanticDomain]
          }
        ]
      }
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
      }
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
    return this.props.spellChecker.correct(word);
  }

  getSpellingSuggestions(word: string): string[] {
    return this.props.spellChecker.getSpellingSuggestions(word);
  }

  resetState() {
    this.setState({
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
            semanticDomains: [this.props.semanticDomain]
          }
        ],
        audio: [],
        created: "",
        modified: "",
        history: [],
        partOfSpeech: "",
        editedBy: [],
        otherField: "",
        plural: ""
      },
      isSpelledCorrectly: true,
      isDuplicate: false
    });
  }

  /** Move the focus to the vernacular textbox */
  focusVernInput() {
    if (this.vernInput.current) this.vernInput.current.focus();
  }

  render() {
    return (
      <Grid item xs={12}>
        <Grid
          container
          onKeyDown={e => {
            if (e.key === "Enter") {
              this.props.addNewWord(this.state.newEntry);
              this.focusVernInput();
              this.resetState();
            }
          }}
        >
          <NewVernEntry
            vernacular={this.state.newEntry.vernacular}
            vernInput={this.vernInput}
            isDuplicate={this.state.isDuplicate}
            toggleDuplicateResolutionView={() =>
              this.toggleDuplicateResolutionView()
            }
            updateVernField={(newValue: string) =>
              this.updateVernField(newValue)
            }
          />
          <NewGlossEntry
            glosses={
              this.state.newEntry.senses &&
              this.state.newEntry.senses[0] &&
              this.state.newEntry.senses[0].glosses &&
              this.state.newEntry.senses[0].glosses[0]
                ? this.state.newEntry.senses[0].glosses[0].def
                : ""
            }
            glossInput={this.glossInput}
            isSpelledCorrectly={this.state.isSpelledCorrectly}
            toggleSpellingSuggestionsView={() =>
              this.toggleSpellingSuggestionsView()
            }
            updateGlossField={(newValue: string) =>
              this.updateGlossField(newValue)
            }
          />
          {this.props.displaySpellingSuggestions && (
            <SpellingSuggestionsView
              mispelledWord={this.state.newEntry.senses[0].glosses[0].def}
              spellingSuggestions={this.getSpellingSuggestions(
                this.state.newEntry.senses &&
                  this.state.newEntry.senses[0] &&
                  this.state.newEntry.senses[0].glosses &&
                  this.state.newEntry.senses[0].glosses[0]
                  ? this.state.newEntry.senses[0].glosses[0].def
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
                  this.state.newEntry.senses &&
                  this.state.newEntry.senses[0] &&
                  this.state.newEntry.senses[0].glosses &&
                  this.state.newEntry.senses[0].glosses[0]
                    ? this.state.newEntry.senses[0].glosses[0].def
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
      </Grid>
    );
  }
}
