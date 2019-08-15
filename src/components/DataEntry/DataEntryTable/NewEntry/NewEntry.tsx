import React from "react";
import { Grid, Typography } from "@material-ui/core";
import { Word, Sense, SemanticDomain } from "../../../../types/word";
import SpellChecker from "../../spellChecker";
import NewVernEntry from "./NewVernEntry/NewVernEntry";
import NewGlossEntry from "./NewGlossEntry/NewGlossEntry";
import { SpellingSuggestionsView } from "../SpellingSuggestions/SpellingSuggestions";
import { DuplicateResolutionView } from "../DuplicateResolutionView/DuplicateResolutionView";
import {
  duplicatesInFrontier,
  addSenseToWord,
  addSemanticDomainToSense
} from "../ExistingEntry/ExistingEntry";
import theme from "../../../../types/theme";
import { Translate } from "react-localize-redux";

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
      isDuplicate: false,
      duplicates: []
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
    this.props.toggleDisplaySpellingSuggestions();
  }

  addNewSense(existingWord: Word, newSense: string) {
    let updatedWord = addSenseToWord(
      this.props.semanticDomain,
      existingWord,
      newSense
    );
    this.props.updateWord(updatedWord, false);
    this.props.toggleDisplayDuplicates();
    this.resetEntry();
    this.setState({
      isDuplicate: false,
      duplicates: []
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
      duplicates: []
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
            semanticDomains: [this.props.semanticDomain]
          }
        ]
      }
    });
  }

  updateVernField(newValue: string) {
    let duplicateIds: string[] = duplicatesInFrontier(
      this.props.allWords,
      newValue,
      5
    );
    let isDuplicate: boolean = duplicateIds.length > 0;
    this.setState({
      isDuplicate: isDuplicate,
      duplicates: this.props.allWords.filter(word =>
        duplicateIds.includes(word.id)
      ),
      newEntry: {
        ...this.state.newEntry,
        vernacular: newValue
      }
    });
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
              position: "relative"
            }}
          >
            <Grid item xs={12} style={{ paddingBottom: theme.spacing(1) }}>
              <NewVernEntry
                vernacular={this.state.newEntry.vernacular}
                vernInput={this.vernInput}
                isDuplicate={this.state.isDuplicate}
                toggleDuplicateResolutionView={() =>
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
              position: "relative"
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
          {this.props.displayDuplicates &&
            this.state.isDuplicate &&
            this.state.duplicates.map(duplicate => (
              <Grid
                item
                xs={12}
                key={"duplicateNewVernEntry"}
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
                /></Grid>
            ))}
        </Grid>
      </Grid>
    );
  }
}
