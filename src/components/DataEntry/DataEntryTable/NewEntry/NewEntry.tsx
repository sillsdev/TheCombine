import { Grid, Typography } from "@material-ui/core";
import React from "react";
import { Translate } from "react-localize-redux";

import theme from "../../../../types/theme";
import { SemanticDomain, simpleWord, Word } from "../../../../types/word";
import Pronunciations from "../../../Pronunciations/PronunciationsComponent";
import Recorder from "../../../Pronunciations/Recorder";
import GlossWithSuggestions from "../GlossWithSuggestions/GlossWithSuggestions";
import VernWithSuggestions from "../VernWithSuggestions/VernWithSuggestions";

interface NewEntryProps {
  allVerns: string[];
  allWords: Word[];
  updateWordWithNewGloss: (
    wordId: string,
    gloss: string,
    audioFileURLs: string[]
  ) => Promise<boolean>;
  addNewWord: (newWord: Word, newAudio: string[]) => Promise<void>;
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
export default class NewEntry extends React.Component<
  NewEntryProps,
  NewEntryState
> {
  constructor(props: NewEntryProps) {
    super(props);
    this.state = {
      newEntry: { ...simpleWord("", ""), id: "" },
      activeGloss: "",
      audioFileURLs: [],
      isDupVern: false,
    };
    this.vernInput = React.createRef<HTMLDivElement>();
    this.glossInput = React.createRef<HTMLDivElement>();
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
    let dupVernWords: Word[] = [];
    let isDupVern: boolean = false;
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
      newEntry: { ...simpleWord("", ""), id: "" },
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

  async addNewWordAndReset() {
    await this.props
      .addNewWord(this.state.newEntry, this.state.audioFileURLs)
      .then(() => {
        this.resetState();
      });
    this.focusVernInput();
  }

  async addOrUpdateWord() {
    if (!this.state.isDupVern || this.state.wordId === "") {
      // Either a new Vern is typed, or user has selected new entry for this duplicate vern
      await this.addNewWordAndReset();
    } else if (this.state.wordId === undefined && this.state.isDupVern) {
      // Duplicate vern and the user hasn't made a selection
      // Change focus away from vern to trigger vern's onBlur
      this.focusGlossInput();
    } else {
      // Duplicate vern and the user has selected an entry to modify,
      // so wordId is defined and non-empty
      await this.props
        .updateWordWithNewGloss(
          this.state.wordId!,
          this.state.activeGloss,
          this.state.audioFileURLs
        )
        .then((result: boolean) => {
          // result=true means that the submission was successsful
          if (result) this.resetState();
        });
    }
  }

  async handleEnterAndTab(e: React.KeyboardEvent) {
    if (e.key === "Enter") {
      if (this.state.newEntry.vernacular) {
        if (this.state.activeGloss) {
          await this.addOrUpdateWord();
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
                selectedWordId={this.state.wordId}
                allVerns={this.props.allVerns}
                handleEnterAndTab={(e: React.KeyboardEvent) =>
                  this.handleEnterAndTab(e)
                }
                setActiveGloss={(newGloss: string) =>
                  this.setState({ activeGloss: newGloss })
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
              isNew={true}
              gloss={this.state.activeGloss}
              glossInput={this.glossInput}
              updateGlossField={(newValue: string) =>
                this.updateGlossField(newValue)
              }
              handleEnterAndTab={(e: React.KeyboardEvent) =>
                this.handleEnterAndTab(e)
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
