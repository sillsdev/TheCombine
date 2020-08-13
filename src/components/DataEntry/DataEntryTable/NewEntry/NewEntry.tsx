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
import VernWithSuggestions from "../VernWithSuggestions/VernWithSuggestions";

interface NewEntryProps {
  allVerns: string[];
  allWords: Word[];
  updateWord: (
    updatedWord: Word,
    senseIndex: number,
    newAudio: string[]
  ) => void;
  addNewWord: (newWord: Word, newAudio: string[]) => void;
  semanticDomain: SemanticDomain;
  setIsReadyState: (isReady: boolean) => void;
  recorder?: Recorder;
}

interface NewEntryState {
  newEntry: Word;
  isDupVern: boolean;
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
      activeGloss: "",
      audioFileURLs: [],
      isDupVern: false,
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

  addNewSense(existingWord: Word, newSense: string) {
    let updatedWord = addSenseToWord(
      this.props.semanticDomain,
      existingWord,
      newSense
    );
    this.props.updateWord(
      updatedWord,
      updatedWord.senses.length - 1,
      this.state.audioFileURLs
    );
    this.resetState();
  }

  addSemanticDomain(existingWord: Word, senseIndex: number) {
    let updatedWord = addSemanticDomainToSense(
      this.props.semanticDomain,
      existingWord,
      senseIndex
    );
    this.props.updateWord(updatedWord, senseIndex, this.state.audioFileURLs);
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

  updateVernField(newValue: string): Word[] {
    var dupVernWords: Word[] = [];
    var isDupVern: boolean = false;
    if (newValue) {
      dupVernWords = this.props.allWords.filter(
        (word: Word) => word.vernacular === newValue
      );
      isDupVern = dupVernWords.length > 0;
    }
    this.setState({
      isDupVern,
      newEntry: {
        ...this.state.newEntry,
        vernacular: newValue,
      },
    });
    return dupVernWords;
  }

  updateWordId(wordId?: string) {
    this.setState({ wordId });
  }

  resetState() {
    this.setState({
      newEntry: this.defaultNewEntry(),
      activeGloss: "",
      audioFileURLs: [],
      isDupVern: false,
      wordId: undefined,
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

  addOrUpdateWord() {
    if (!this.state.isDupVern || this.state.wordId === "") {
      // Either a new Vern is typed, or user has selected new entry for this duplicate vern
      this.addNewWordAndReset();
    } else if (this.state.wordId === undefined && this.state.isDupVern) {
      // Duplicate vern and the user hasn't made a selection
      // Change focus away from vern to trigger vern's onBlur
      this.focusGlossInput();
    } else {
      // Duplicate vern and the user has selected an entry to modify,
      // so wordId is defined and non-empty
      let existingWord: Word | undefined = this.props.allWords.find(
        (word: Word) => word.id === this.state.wordId
      );
      if (!existingWord)
        throw new Error(
          "Attempting to edit an existing word but did not find one"
        );
      existingWord.senses.forEach((sense: Sense, index: number) => {
        if (
          sense.glosses &&
          sense.glosses.length &&
          sense.glosses[0].def === this.state.activeGloss
        ) {
          if (
            sense.semanticDomains
              .map((semanticDomain) => semanticDomain.id)
              .includes(this.props.semanticDomain.id)
          ) {
            // User is trying to add a sense that already exists
            return;
          } else {
            this.addSemanticDomain(existingWord!, index); //Existing word already null checked
            return;
          }
        }
      });
      this.addNewSense(existingWord, this.state.activeGloss);
    }
  }

  handleEnter(e: React.KeyboardEvent) {
    if (e.key === "Enter") {
      if (this.state.newEntry.vernacular) {
        if (this.state.activeGloss) {
          this.addOrUpdateWord();
          this.resetState();
          this.focusVernInput();
        } else {
          this.focusGlossInput();
        }
      } else {
        this.focusVernInput();
      }
    }
  }

  render() {
    return (
      <Grid item xs={12}>
        <Grid container>
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
              <VernWithSuggestions
                isNew={true}
                vernacular={this.state.newEntry.vernacular}
                vernInput={this.vernInput}
                updateVernField={(newValue: string) => {
                  this.props.setIsReadyState(newValue.trim().length > 0);
                  return this.updateVernField(newValue);
                }}
                updateWordId={(wordId?: string) => this.updateWordId(wordId)}
                allVerns={this.props.allVerns}
                handleEnter={(e: React.KeyboardEvent) => this.handleEnter(e)}
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
              handleEnter={(e: React.KeyboardEvent) => this.handleEnter(e)}
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
