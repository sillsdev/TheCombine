import { Grid, Typography } from "@material-ui/core";
import React from "react";
import { Translate } from "react-localize-redux";
import { Key } from "ts-key-enum";

import { SemanticDomain, Word } from "api/models";
import Pronunciations from "components/Pronunciations/PronunciationsComponent";
import Recorder from "components/Pronunciations/Recorder";
import {
  DeleteEntry,
  EntryNote,
  GlossWithSuggestions,
  VernWithSuggestions,
} from "components/DataEntry/DataEntryTable/EntryCellComponents";
import SenseDialog from "components/DataEntry/DataEntryTable/NewEntry/SenseDialog";
import VernDialog from "components/DataEntry/DataEntryTable/NewEntry/VernDialog";
import theme from "types/theme";
import { newSense, newWord } from "types/word";
import { LevenshteinDistance } from "utilities";

interface NewEntryProps {
  allVerns: string[];
  allWords: Word[];
  defunctWordIds: string[];
  updateWordWithNewGloss: (
    wordId: string,
    gloss: string,
    audioFileURLs: string[]
  ) => void;
  addNewWord: (newEntry: Word, newAudio: string[]) => void;
  semanticDomain: SemanticDomain;
  setIsReadyState: (isReady: boolean) => void;
  recorder?: Recorder;
  analysisLang: string;
}

interface NewEntryState {
  newEntry: Word;
  suggestedVerns: string[];
  dupVernWords: Word[];
  activeGloss: string;
  audioFileURLs: string[];
  vernOpen: boolean;
  senseOpen: boolean;
  selectedWord?: Word;
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
  private readonly levDistance = new LevenshteinDistance();
  private readonly maxSuggestions = 5;
  private readonly maxLevDistance = 3;

  constructor(props: NewEntryProps) {
    super(props);
    this.state = {
      newEntry: newWord(),
      activeGloss: "",
      audioFileURLs: [],
      suggestedVerns: [],
      dupVernWords: [],
      vernOpen: false,
      senseOpen: false,
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
    this.setState((prevState) => ({
      audioFileURLs: prevState.audioFileURLs.filter(
        (fileURL) => fileURL !== fileName
      ),
    }));
  }

  updateGlossField(newValue: string) {
    this.setState((prevState, props) => ({
      newEntry: {
        ...prevState.newEntry,
        senses: [newSense(newValue, props.analysisLang, props.semanticDomain)],
      },
      activeGloss: newValue,
    }));
  }

  updateVernField(newValue: string, openDialog?: boolean) {
    const stateUpdates: Partial<NewEntryState> = {};
    if (newValue !== this.state.newEntry.vernacular) {
      this.props.setIsReadyState(newValue.trim().length > 0);
      this.updateSuggestedVerns(newValue);
      let dupVernWords: Word[] = [];
      if (newValue) {
        dupVernWords = this.props.allWords.filter(
          (word) =>
            word.vernacular === newValue &&
            !this.props.defunctWordIds.includes(word.id)
          // Weed out any words that are already being edited
        );
      }
      stateUpdates.dupVernWords = dupVernWords;
      stateUpdates.newEntry = { ...this.state.newEntry, vernacular: newValue };
    }
    this.setState(stateUpdates as NewEntryState, () => {
      if (
        openDialog &&
        this.state.dupVernWords.length &&
        !this.state.selectedWord
      ) {
        this.setState({ vernOpen: true });
      }
    });
  }

  updateNote(text: string) {
    this.setState((prevState, props) => ({
      newEntry: {
        ...prevState.newEntry,
        note: { text, language: props.analysisLang },
      },
    }));
  }

  resetState() {
    this.setState({
      newEntry: newWord(),
      activeGloss: "",
      audioFileURLs: [],
      suggestedVerns: [],
      dupVernWords: [],
      selectedWord: undefined,
    });
    this.focusVernInput();
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
    const newEntry: Word = this.state.newEntry.senses.length
      ? this.state.newEntry
      : {
          ...this.state.newEntry,
          senses: [
            newSense("", this.props.analysisLang, this.props.semanticDomain),
          ],
        };
    this.props.addNewWord(newEntry, this.state.audioFileURLs);
    this.resetState();
  }

  updateWordAndReset() {
    this.props.updateWordWithNewGloss(
      this.state.selectedWord!.id,
      this.state.activeGloss,
      this.state.audioFileURLs
    );
    this.resetState();
  }

  addOrUpdateWord() {
    if (this.state.dupVernWords.length) {
      // Duplicate vern ...
      if (!this.state.selectedWord) {
        // ... and user hasn't made a selection
        this.setState({ vernOpen: true });
      } else if (this.state.selectedWord.id) {
        // ... and user has selected an entry to modify
        this.updateWordAndReset();
      } else {
        // ... and user has selected new entry
        this.addNewWordAndReset();
      }
    } else {
      // New Vern is typed
      this.addNewWordAndReset();
    }
  }

  handleEnter(e: React.KeyboardEvent, checkGloss: boolean) {
    if (!this.state.vernOpen && e.key === Key.Enter) {
      // The user can never submit a new entry without a vernacular
      if (this.state.newEntry.vernacular) {
        // The user can conditionally submit a new entry without a gloss
        if (this.state.activeGloss || !checkGloss) {
          this.addOrUpdateWord();
          this.focusVernInput();
        } else {
          this.focusGlossInput();
        }
      } else {
        this.focusVernInput();
      }
    }
  }

  handleCloseVernDialog(selectedWordId?: string) {
    let selectedWord: Word | undefined;
    let senseOpen = false;
    if (selectedWordId === "") {
      selectedWord = newWord(this.state.newEntry.vernacular);
    } else if (selectedWordId) {
      selectedWord = this.state.dupVernWords.find(
        (word: Word) => word.id === selectedWordId
      );
      senseOpen = true;
    }
    this.setState({ selectedWord, senseOpen, vernOpen: false });
  }

  handleCloseSenseDialog(senseIndex?: number) {
    if (senseIndex === undefined) {
      this.setState({ selectedWord: undefined, vernOpen: true });
    } else if (senseIndex >= 0) {
      const gloss = this.state.selectedWord!.senses[senseIndex].glosses[0].def;
      this.updateGlossField(gloss);
    } // Otherwise, senseIndex===-1, which indicates new sense for the selectedWord
    this.setState({ senseOpen: false });
  }

  autoCompleteCandidates(vernacular: string): string[] {
    // filter allVerns to those that start with vernacular
    // then map them into an array sorted by length and take the 2 shortest
    // and the rest longest (should make finding the long words easier)
    let scoredStartsWith: [string, number][] = [];
    let startsWith = this.props.allVerns.filter((vern: string) =>
      vern.startsWith(vernacular)
    );
    for (const v of startsWith) {
      scoredStartsWith.push([v, v.length]);
    }
    let keepers = scoredStartsWith
      .sort((a, b) => a[1] - b[1])
      .map((vern) => vern[0]);
    if (keepers.length > this.maxSuggestions) {
      keepers.splice(2, keepers.length - this.maxSuggestions);
    }
    return keepers;
  }

  updateSuggestedVerns(value?: string | null) {
    let suggestedVerns: string[] = [];
    if (value) {
      suggestedVerns = [...this.autoCompleteCandidates(value)];
      if (suggestedVerns.length < this.maxSuggestions) {
        const viableVerns: string[] = this.props.allVerns.filter(
          (vern: string) =>
            this.levDistance.getDistance(vern, value) < this.maxLevDistance
        );
        const sortedVerns: string[] = viableVerns.sort(
          (a: string, b: string) =>
            this.levDistance.getDistance(a, value) -
            this.levDistance.getDistance(b, value)
        );
        let candidate: string;
        while (
          suggestedVerns.length < this.maxSuggestions &&
          sortedVerns.length
        ) {
          candidate = sortedVerns.shift()!;
          if (!suggestedVerns.includes(candidate)) {
            suggestedVerns.push(candidate);
          }
        }
      }
    }
    this.setState({ suggestedVerns });
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
                updateVernField={(newValue: string, openDialog?: boolean) => {
                  this.updateVernField(newValue, openDialog);
                }}
                onBlur={() => {
                  this.updateVernField(this.state.newEntry.vernacular, true);
                }}
                suggestedVerns={this.state.suggestedVerns}
                handleEnterAndTab={(e: React.KeyboardEvent) =>
                  // To prevent unintentional no-gloss submissions:
                  // If enter pressed from the vern field,
                  // check whether gloss is empty
                  this.handleEnter(e, true)
                }
                textFieldId="new-entry-vernacular"
              />
              <VernDialog
                open={this.state.vernOpen}
                handleClose={(selectedWordId?: string) =>
                  this.handleCloseVernDialog(selectedWordId)
                }
                vernacularWords={this.state.dupVernWords}
                analysisLang={this.props.analysisLang}
              />
              {this.state.selectedWord && (
                <SenseDialog
                  selectedWord={this.state.selectedWord}
                  open={this.state.senseOpen}
                  handleClose={(senseIndex?: number) =>
                    this.handleCloseSenseDialog(senseIndex)
                  }
                  analysisLang={this.props.analysisLang}
                />
              )}
            </Grid>
            <Grid item xs={12}>
              <Typography variant="caption">
                <Translate id="addWords.pressEnter" />
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
                // To allow intentional no-gloss submissions:
                // If enter pressed from the gloss field,
                // don't check whether gloss is empty
                this.handleEnter(e, false)
              }
              analysisLang={this.props.analysisLang}
              textFieldId={"new-entry-gloss"}
            />
          </Grid>
          <Grid
            item
            xs={1}
            style={{
              paddingLeft: theme.spacing(1),
              paddingRight: theme.spacing(1),
              position: "relative",
            }}
          >
            {!this.state.selectedWord && (
              // note is not available if user selected to modify an exiting entry
              <EntryNote
                noteText={this.state.newEntry.note.text}
                updateNote={(text: string) => this.updateNote(text)}
                buttonId="note-entry-new"
              />
            )}
          </Grid>
          <Grid
            item
            xs={2}
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
              deleteAudio={(_, fileName: string) => {
                this.removeAudio(fileName);
              }}
              uploadAudio={(_, audioFile: File) => {
                this.addAudio(audioFile);
              }}
              getAudioUrl={(_, fileName: string) => fileName}
            />
          </Grid>
          <Grid
            item
            xs={1}
            style={{
              paddingLeft: theme.spacing(1),
              paddingRight: theme.spacing(1),
              position: "relative",
            }}
          >
            <DeleteEntry removeEntry={() => this.resetState()} />
          </Grid>
        </Grid>
      </Grid>
    );
  }
}
