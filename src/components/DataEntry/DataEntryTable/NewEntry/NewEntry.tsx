import { Grid, Typography } from "@material-ui/core";
import React from "react";
import { Translate } from "react-localize-redux";

import { AutoComplete } from "../../../../types/AutoComplete";
import theme from "../../../../types/theme";
import { SemanticDomain, Sense, Word } from "../../../../types/word";
import { DuplicateResolutionView } from "../DuplicateResolutionView/DuplicateResolutionView";
import {
  addSemanticDomainToSense,
  addSenseToWord,
} from "../ExistingEntry/ExistingEntry";
import GlossWithSuggestions from "../GlossWithSuggestions/GlossWithSuggestions";
import NewVernEntry from "./NewVernEntry/NewVernEntry";

interface NewEntryProps {
  allWords: Word[];
  updateWord: (
    updatedWord: Word,
    glossIndex: number,
    shouldBeMutable?: boolean
  ) => void;
  addNewWord: (newWord: Word) => void;
  semanticDomain: SemanticDomain;
  autocompleteSetting: AutoComplete;
  displayDuplicates: boolean;
  toggleDisplayDuplicates: () => void;
  setIsReadyState: (isReady: boolean) => void;
}

interface NewEntryState {
  newEntry: Word;
  duplicates: Word[];
  isDuplicate: boolean;
  activeGloss: string;
}

/**
 * Displays data related to creating a new word entry
 */
export class NewEntry extends React.Component<NewEntryProps, NewEntryState> {
  constructor(props: NewEntryProps) {
    super(props);
    this.state = {
      newEntry: this.defaultNewEntry(),
      isDuplicate: false,
      duplicates: [],
      activeGloss: "",
    };

    this.vernInput = React.createRef<HTMLDivElement>();
    this.glossInput = React.createRef<HTMLDivElement>();
    this.duplicateInput = React.createRef<HTMLDivElement>();
  }
  private defaultNewEntry() {
    return {
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
    };
  }
  vernInput: React.RefObject<HTMLDivElement>;
  glossInput: React.RefObject<HTMLDivElement>;
  duplicateInput: React.RefObject<HTMLDivElement>;

  toggleDuplicateResolutionView() {
    this.props.toggleDisplayDuplicates();
  }

  addNewSense(existingWord: Word, newSense: string, index: number) {
    let updatedWord = addSenseToWord(
      this.props.semanticDomain,
      existingWord,
      newSense
    );
    this.props.updateWord(updatedWord, index, false);
    this.props.toggleDisplayDuplicates();
    this.resetState();
  }

  addSemanticDomain(existingWord: Word, sense: Sense, index: number) {
    let updatedWord = addSemanticDomainToSense(
      this.props.semanticDomain,
      existingWord,
      sense,
      index
    );
    this.props.updateWord(updatedWord, index, false);
    this.props.toggleDisplayDuplicates();
    this.resetState();
  }

  updateGlossField(newValue: string) {
    this.setState({
      newEntry: {
        ...this.state.newEntry,
        senses: [
          {
            glosses: [{ language: "en", def: newValue }],
            semanticDomains: [this.props.semanticDomain],
          },
        ],
      },
      activeGloss: newValue,
    });
  }

  resetState() {
    this.setState({
      newEntry: this.defaultNewEntry(),
      isDuplicate: false,
      duplicates: [],
      activeGloss: "",
    });
  }

  /** Move the focus to the vernacular textbox */
  focusVernInput() {
    if (this.vernInput.current) {
      this.vernInput.current.focus();
      this.vernInput.current.scrollIntoView({ behavior: "smooth" });
    }
  }

  focusAutoScroll = () => {
    if (this.duplicateInput.current) {
      this.duplicateInput.current.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }
  };

  render() {
    return (
      <Grid item xs={12}>
        <Grid
          container
          onKeyUp={(e) => {
            if (e.key === "Enter" && this.state.newEntry.vernacular) {
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
                duplicates={[]}
                vernacular={this.state.newEntry.vernacular}
                newEntry={this.state.newEntry}
                vernInput={this.vernInput}
                allWords={this.props.allWords}
                autocompleteSetting={this.props.autocompleteSetting}
                showAutocompleteToggle={
                  this.props.autocompleteSetting === AutoComplete.OnRequest &&
                  this.state.isDuplicate
                }
                toggleAutocompleteView={() =>
                  this.toggleDuplicateResolutionView()
                }
                updateNewEntry={(newEntryUpdated: Word) =>
                  this.setState({ newEntry: newEntryUpdated })
                }
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="caption">
                {<Translate id="addWords.pressEnter" />}
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
            <GlossWithSuggestions
              gloss={this.state.activeGloss}
              glossInput={this.glossInput}
              updateGlossField={(newValue: string) =>
                this.updateGlossField(newValue)
              }
            />
          </Grid>
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
                    newSense={this.state.activeGloss}
                    addSense={(
                      existingWord: Word,
                      newSense: string,
                      index: number
                    ) => this.addNewSense(existingWord, newSense, index)}
                    addSemanticDomain={(
                      existingWord: Word,
                      sense: Sense,
                      index: number
                    ) => this.addSemanticDomain(existingWord, sense, index)}
                    duplicateInput={this.duplicateInput}
                  />
                </Grid>
              )
            )}
        </Grid>
      </Grid>
    );
  }
}
