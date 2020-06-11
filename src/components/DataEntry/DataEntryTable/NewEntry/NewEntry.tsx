import { Grid, Typography } from "@material-ui/core";
import React from "react";
import { Translate } from "react-localize-redux";
import { AutoComplete } from "../../../../types/AutoComplete";
import theme from "../../../../types/theme";
import { SemanticDomain, Sense, Word } from "../../../../types/word";
import SpellChecker from "../../spellChecker";
import { DuplicateResolutionView } from "../DuplicateResolutionView/DuplicateResolutionView";
import {
  addSemanticDomainToSense,
  addSenseToWord,
  duplicatesFromFrontier,
} from "../ExistingEntry/ExistingEntry";
import { SpellingSuggestionsView } from "../SpellingSuggestions/SpellingSuggestions";
import NewGlossEntry from "./NewGlossEntry/NewGlossEntry";
import NewVernEntry from "./NewVernEntry/NewVernEntry";

interface NewEntryProps {
  allWords: Word[];
  updateWord: (updatedWord: Word, shouldBeMutable?: boolean) => void;
  addNewWord: (newWord: Word) => void;
  spellChecker: SpellChecker;
  semanticDomain: SemanticDomain;
  autocompleteSetting: AutoComplete;
  displayDuplicates: boolean;
  toggleDisplayDuplicates: () => void;
  displaySpellingSuggestions: boolean;
  toggleDisplaySpellingSuggestions: () => void;
  setIsReadyState: (isReady: boolean) => void;
}

interface NewEntryState {
  newEntry: Word;
  duplicates: Word[];
  isSpelledCorrectly: boolean;
  isDuplicate: boolean;
}

/**
 * Displays data related to creating a new word entry
 */
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
                def: "",
              },
            ],
            semanticDomains: [this.props.semanticDomain],
          },
        ],
        audio: [],
        created: "",
        modified: "",
        history: [],
        partOfSpeech: "",
        editedBy: [],
        otherField: "",
        plural: "",
      },
      isSpelledCorrectly: true,
      isDuplicate: false,
      duplicates: [],
    };

    this.vernInput = React.createRef<HTMLDivElement>();
    this.glossInput = React.createRef<HTMLDivElement>();
  }

  readonly maxStartsWith: number = 4;
  readonly maxDuplicates: number = 2;

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
                def: "",
              },
            ],
            semanticDomains: [this.props.semanticDomain],
          },
        ],
        audio: [],
        created: "",
        modified: "",
        history: [],
        partOfSpeech: "",
        editedBy: [],
        otherField: "",
        plural: "",
      },
    });
  }

  chooseSpellingSuggestion(suggestion: string) {
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
                def: suggestion,
              },
            ],
          },
        ],
      },
    });
    this.props.toggleDisplaySpellingSuggestions();
  }

  addNewSense(existingWord: Word, newSense: string) {
    let updatedWord = addSenseToWord(
      this.props.semanticDomain,
      existingWord,
      newSense
    );
    this.props.updateWord(updatedWord, true);
    this.props.toggleDisplayDuplicates();
    this.resetEntry();
    this.setState({
      isDuplicate: false,
      duplicates: [],
    });
  }

  addSemanticDomain(existingWord: Word, sense: Sense, index: number) {
    let updatedWord = addSemanticDomainToSense(
      this.props.semanticDomain,
      existingWord,
      sense,
      index
    );
    this.props.updateWord(updatedWord, false);
    this.props.toggleDisplayDuplicates();
    this.resetEntry();
    this.setState({
      isDuplicate: false,
      duplicates: [],
    });
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
            semanticDomains: [this.props.semanticDomain],
          },
        ],
      },
    });
  }

  updateVernField(newValue: string) {
    let autoCompleteWords: Word[] = this.autoCompleteCandidates(
      this.props.allWords,
      newValue
    );
    let isDuplicate: boolean =
      this.props.autocompleteSetting !== AutoComplete.Off &&
      autoCompleteWords.length > 0;
    this.setState({
      isDuplicate: isDuplicate,
      duplicates: autoCompleteWords,
      newEntry: {
        ...this.state.newEntry,
        vernacular: newValue,
      },
    });
  }

  isSpelledCorrectly(word: string): boolean {
    // split on space to allow phrases
    let words = word.split(" ");
    let allCorrect = true;
    words.forEach((w) => {
      let result = this.props.spellChecker.correct(w);
      allCorrect = allCorrect && result;
    });
    return allCorrect;
  }

  getSpellingSuggestions(word: string): string[] {
    // TODO: handle spelling suggestions for phrases
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
                def: "",
              },
            ],
            semanticDomains: [this.props.semanticDomain],
          },
        ],
        audio: [],
        created: "",
        modified: "",
        history: [],
        partOfSpeech: "",
        editedBy: [],
        otherField: "",
        plural: "",
      },
      isSpelledCorrectly: true,
      isDuplicate: false,
    });
  }

  /** Returns autocomplete choices from the frontier words
   * Populates maxStartsWith 'starts with' options and then
   * adds up to maxDuplicates options
   */
  autoCompleteCandidates(existingWords: Word[], vernacular: string): Word[] {
    // filter existingWords to those that start with vernacular
    // then map them into an array sorted by length and take the 2 shortest
    // and the rest longest (should make finding the long words easier)
    let scoredStartsWith: [Word, number][] = [];
    let startsWith = existingWords.filter((word) =>
      word.vernacular.startsWith(vernacular)
    );
    for (let w of startsWith) {
      scoredStartsWith.push([w, w.vernacular.length]);
    }
    var keepers = scoredStartsWith
      .sort((a, b) => a[1] - b[1])
      .map((word) => word[0]);
    if (keepers.length > 4) {
      keepers.splice(2, keepers.length - this.maxStartsWith);
    }
    for (let d of duplicatesFromFrontier(
      existingWords,
      vernacular,
      this.maxDuplicates
    )) {
      let word = existingWords.find((word) => word.id === d);
      if (word !== undefined && !keepers.includes(word)) {
        keepers.push(word);
      }
    }
    return keepers;
  }

  /** Move the focus to the vernacular textbox */
  focusVernInput() {
    if (this.vernInput.current) {
      this.vernInput.current.focus();
      this.vernInput.current.scrollIntoView({ behavior: "smooth" });
    }
  }

  render() {
    return (
      <Grid item xs={12}>
        <Grid
          container
          onKeyDown={(e) => {
            if (e.key === "Enter" && this.state.newEntry.vernacular !== "") {
              this.props.addNewWord(this.state.newEntry);
              this.focusVernInput();
              this.resetState();
            }
          }}
        >
          <Grid
            container
            item
            xs={4}
            style={{
              paddingLeft: theme.spacing(2),
              paddingRight: theme.spacing(2),
              position: "relative",
            }}
          >
            <Grid item xs={12} style={{ paddingBottom: theme.spacing(1) }}>
              <NewVernEntry
                vernacular={this.state.newEntry.vernacular}
                vernInput={this.vernInput}
                showAutocompleteToggle={
                  this.props.autocompleteSetting === AutoComplete.OnRequest &&
                  this.state.isDuplicate
                }
                toggleAutocompleteView={() =>
                  this.toggleDuplicateResolutionView()
                }
                updateVernField={(newValue: string) => {
                  this.updateVernField(newValue);
                  this.props.setIsReadyState(newValue.trim().length > 0);
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="caption">
                {<Translate id="newentry.pressEnter" />}
              </Typography>
            </Grid>
          </Grid>
          <Grid
            item
            xs={4}
            style={{
              paddingLeft: theme.spacing(2),
              paddingRight: theme.spacing(2),
              position: "relative",
            }}
          >
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
          </Grid>
          {this.props.displaySpellingSuggestions && (
            <Grid
              item
              xs={12}
              key={"mispelledNewEntry"}
              style={{ background: "whitesmoke" }}
            >
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
            </Grid>
          )}
          {this.props.autocompleteSetting !== AutoComplete.Off &&
            this.props.displayDuplicates &&
            this.state.isDuplicate &&
            this.state.duplicates.map((duplicate) =>
              duplicate === null ? null : (
                <Grid
                  item
                  xs={12}
                  key={"duplicateNewVernEntry" + duplicate.id}
                  style={{ background: "whitesmoke" }}
                >
                  <DuplicateResolutionView
                    existingEntry={duplicate}
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
                </Grid>
              )
            )}
        </Grid>
      </Grid>
    );
  }
}
