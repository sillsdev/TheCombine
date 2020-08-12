import { Grid, Typography } from "@material-ui/core";
import React from "react";
import { Translate } from "react-localize-redux";

import theme from "../../../../types/theme";
import { SemanticDomain, Sense, Word } from "../../../../types/word";
import Pronunciations from "../../../Pronunciations/PronunciationsComponent";
import Recorder from "../../../Pronunciations/Recorder";
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
    newAudio: string[]
  ) => void;
  addNewWord: (newWord: Word, newAudio: string[]) => void;
  semanticDomain: SemanticDomain;
  setIsReadyState: (isReady: boolean) => void;
  recorder?: Recorder;
}

interface NewEntryState {
  newEntry: Word;
  isNew: boolean;
  wordId?: string;
  activeGloss: string;
  audioFileURLs: string[];
}

function focusInput(inputRef: React.RefObject<HTMLDivElement>) {
  if (inputRef.current) {
    inputRef.current.focus();
    inputRef.current.scrollIntoView({ behavior: "smooth" });
  }
}

/**
 * Displays data related to creating a new word entry
 */
export class NewEntry extends React.Component<NewEntryProps, NewEntryState> {
  constructor(props: NewEntryProps) {
    super(props);
    this.state = {
      newEntry: this.defaultNewEntry(),
      isNew: true,
      activeGloss: "",
      audioFileURLs: [],
    };

    this.vernInput = React.createRef<HTMLDivElement>();
    this.glossInput = React.createRef<HTMLDivElement>();
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
    let isNew: boolean =
      this.props.allWords.filter((word: Word) => word.vernacular === newValue)
        .length === 0;
    this.setState({
      isNew,
      newEntry: {
        ...this.state.newEntry,
        vernacular: newValue,
      },
    });
  }

  updateWordId(wordId: string) {
    if (wordId) {
      this.setState({ isNew: false });
    }
    this.setState({ wordId });
  }

  clearWordId() {
    this.setState({ isNew: true, wordId: undefined });
  }

  resetState() {
    this.setState({
      newEntry: this.defaultNewEntry(),
      activeGloss: "",
      audioFileURLs: [],
    });
  }

  /** Move the focus to the vernacular textbox */
  focusVernInput() {
    focusInput(this.vernInput);
  }

  /** Move the focus to the gloss textbox */
  focusGlossInput() {
    focusInput(this.glossInput);
  }

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
            if (e.key === "Enter") {
              if (this.state.newEntry.vernacular) {
                if (this.state.activeGloss) {
                  this.addNewWordAndReset();
                } else {
                  this.focusGlossInput();
                }
              } else {
                this.focusVernInput();
              }
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
                isNew={true}
                vernacular={this.state.newEntry.vernacular}
                vernInput={this.vernInput}
                updateVernField={(newValue: string) => {
                  this.updateVernField(newValue);
                  this.props.setIsReadyState(newValue.trim().length > 0);
                }}
                updateWordId={(wordId: string) => this.updateWordId(wordId)}
                allWords={this.props.allWords}
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
        </Grid>
      </Grid>
    );
  }
}
