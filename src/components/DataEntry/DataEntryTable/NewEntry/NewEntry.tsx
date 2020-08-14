import { Grid, Typography } from "@material-ui/core";
import React from "react";
import { Translate } from "react-localize-redux";

import { AutoComplete } from "../../../../types/AutoComplete";
import theme from "../../../../types/theme";
import { SemanticDomain, Sense, Word } from "../../../../types/word";
import Pronunciations from "../../../Pronunciations/PronunciationsComponent";
import Recorder from "../../../Pronunciations/Recorder";
import { DuplicateResolutionView } from "../DuplicateResolutionView/DuplicateResolutionView";
import {
  addSemanticDomainToSense,
  addSenseToWord,
  duplicatesFromFrontier,
} from "../ExistingEntry/ExistingEntry";
import GlossWithSuggestions from "../GlossWithSuggestions/GlossWithSuggestions";
import NewVernEntry from "./NewVernEntry/NewVernEntry";

interface NewEntryProps {
  allWords: Word[];
  updateWord: (
    updatedWord: Word,
    glossIndex: number,
    newAudio: string[]
  ) => void;
  addNewWord: (newWord: Word, newAudio: string[]) => void;
  semanticDomain: SemanticDomain;
  autocompleteSetting: AutoComplete;
  displayDuplicates: boolean;
  toggleDisplayDuplicates: () => void;
  setIsReadyState: (isReady: boolean) => void;
  recorder?: Recorder;
}

interface NewEntryState {
  newEntry: Word;
  duplicates: Word[];
  isDuplicate: boolean;
  activeGloss: string;
  audioFileURLs: string[];
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
      audioFileURLs: [],
    };

    this.vernInput = React.createRef<HTMLDivElement>();
    this.glossInput = React.createRef<HTMLDivElement>();
    this.duplicateInput = React.createRef<HTMLDivElement>();
  }

  readonly maxStartsWith: number = 4;
  readonly maxDuplicates: number = 2;

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

  addAudio(audioFile: File) {
    let audioFileURLs = [...this.state.audioFileURLs];
    audioFileURLs.push(URL.createObjectURL(audioFile));
    this.setState({
      audioFileURLs,
    });
  }

  removeAudio(fileName: string) {
    const audioFileURLs = this.state.audioFileURLs.filter(
      (fileURL) => fileURL !== fileName
    );
    this.setState({
      audioFileURLs,
    });
  }

  addNewSense(existingWord: Word, newSense: string, index: number) {
    let updatedWord = addSenseToWord(
      this.props.semanticDomain,
      existingWord,
      newSense
    );
    this.props.updateWord(updatedWord, index, this.state.audioFileURLs);
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
    this.props.updateWord(updatedWord, index, this.state.audioFileURLs);
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

  updateVernField(newValue: string) {
    this.focusAutoScroll();
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

  resetState() {
    this.setState({
      newEntry: this.defaultNewEntry(),
      isDuplicate: false,
      duplicates: [],
      activeGloss: "",
      audioFileURLs: [],
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

  focusAutoScroll = () => {
    if (this.duplicateInput.current) {
      this.duplicateInput.current.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }
  };

  addNewWordAndReset() {
    this.props.addNewWord(this.state.newEntry, this.state.audioFileURLs);
    this.focusVernInput();
    this.resetState();
  }

  render() {
    return (
      <Grid item xs={12}>
        <Grid
          container
          onKeyUp={(e) => {
            if (e.key === "Enter" && this.state.newEntry.vernacular)
              this.addNewWordAndReset();
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
              isNew={true}
              gloss={this.state.activeGloss}
              glossInput={this.glossInput}
              updateGlossField={(newValue: string) =>
                this.updateGlossField(newValue)
              }
            />
          </Grid>
          <Grid
            item
            xs={3}
            style={{
              paddingLeft: theme.spacing(1),
              paddingRight: theme.spacing(1),
              position: "relative",
            }}
          >
            <Pronunciations
              wordId={""}
              pronunciationFiles={this.state.audioFileURLs}
              recorder={this.props.recorder}
              deleteAudio={(_wordId: string, fileName: string) => {
                this.removeAudio(fileName);
              }}
              uploadAudio={(_wordId: string, audioFile: File) => {
                this.addAudio(audioFile);
              }}
              getAudioUrl={(_wordId: string, fileName: string) => fileName}
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
