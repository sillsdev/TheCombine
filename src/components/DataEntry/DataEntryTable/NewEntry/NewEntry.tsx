import { Grid, Typography } from "@material-ui/core";
import React, { ReactElement } from "react";
import { Translate } from "react-localize-redux";
import { Key } from "ts-key-enum";

import { SemanticDomain, Word, WritingSystem } from "api/models";
import {
  DeleteEntry,
  EntryNote,
  GlossWithSuggestions,
  VernWithSuggestions,
} from "components/DataEntry/DataEntryTable/EntryCellComponents";
import SenseDialog from "components/DataEntry/DataEntryTable/NewEntry/SenseDialog";
import VernDialog from "components/DataEntry/DataEntryTable/NewEntry/VernDialog";
import Pronunciations from "components/Pronunciations/PronunciationsComponent";
import Recorder from "components/Pronunciations/Recorder";
import theme from "types/theme";
import { firstGlossText, newSense, newWord } from "types/word";
import { LevenshteinDistance } from "utilities";

const idAffix = "new-entry";

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
  analysisLang: WritingSystem;
  vernacularLang: WritingSystem;
}

export enum FocusTarget {
  Gloss,
  Vernacular,
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
  shouldFocus?: FocusTarget;
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

  async componentDidUpdate(
    _: NewEntryProps,
    prevState: NewEntryState
  ): Promise<void> {
    /* When the vern/sense dialogs are closed, focus needs to return to text
    fields. The following sets a flag (state.shouldFocus) to trigger focus once
    the input components are updated. Focus is triggered by
    this.conditionalFocus() passed to each input component and called within its
    respective componentDidUpdate(). */
    if (
      (prevState.vernOpen || prevState.senseOpen) &&
      !(this.state.vernOpen || this.state.senseOpen)
    ) {
      this.setState((state: NewEntryState) => ({
        shouldFocus: state.selectedWord
          ? FocusTarget.Gloss
          : FocusTarget.Vernacular,
      }));
    }
  }

  focus(target: FocusTarget): void {
    switch (target) {
      case FocusTarget.Gloss:
        focusInput(this.glossInput);
        return;
      case FocusTarget.Vernacular:
        focusInput(this.vernInput);
        return;
    }
  }

  /** This function is for a child input component to call in componentDidUpdate
   * to move focus to itself, if the current state.shouldFocus says it should. */
  conditionalFocus(target: FocusTarget): void {
    if (this.state.shouldFocus === target) {
      this.focus(target);
      this.setState({ shouldFocus: undefined });
    }
  }

  addAudio(audioFile: File): void {
    const audioFileURLs = [...this.state.audioFileURLs];
    audioFileURLs.push(URL.createObjectURL(audioFile));
    this.setState({
      audioFileURLs,
    });
  }

  removeAudio(fileName: string): void {
    this.setState((prevState) => ({
      audioFileURLs: prevState.audioFileURLs.filter(
        (fileURL) => fileURL !== fileName
      ),
    }));
  }

  updateGlossField(newValue: string): void {
    this.setState((prevState, props) => ({
      newEntry: {
        ...prevState.newEntry,
        senses: [
          newSense(newValue, props.analysisLang.bcp47, props.semanticDomain),
        ],
      },
      activeGloss: newValue,
    }));
  }

  updateVernField(newValue: string, openDialog?: boolean): void {
    const stateUpdates: Partial<NewEntryState> = {};
    if (newValue !== this.state.newEntry.vernacular) {
      if (this.state.selectedWord) {
        this.setState({ selectedWord: undefined });
      }
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

  updateNote(text: string): void {
    this.setState((prevState, props) => ({
      newEntry: {
        ...prevState.newEntry,
        note: { text, language: props.analysisLang.bcp47 },
      },
    }));
  }

  resetState(): void {
    this.setState({
      newEntry: newWord(),
      activeGloss: "",
      audioFileURLs: [],
      suggestedVerns: [],
      dupVernWords: [],
      selectedWord: undefined,
    });
    this.focus(FocusTarget.Vernacular);
  }

  addNewWordAndReset(): void {
    const newEntry: Word = this.state.newEntry.senses.length
      ? this.state.newEntry
      : {
          ...this.state.newEntry,
          senses: [
            newSense(
              "",
              this.props.analysisLang.bcp47,
              this.props.semanticDomain
            ),
          ],
        };
    this.props.addNewWord(newEntry, this.state.audioFileURLs);
    this.resetState();
  }

  addOrUpdateWord(): void {
    if (this.state.dupVernWords.length) {
      // Duplicate vern ...
      if (!this.state.selectedWord) {
        // ... and user hasn't made a selection
        this.setState({ vernOpen: true });
      } else if (this.state.selectedWord.id) {
        // ... and user has selected an entry to modify
        this.props.updateWordWithNewGloss(
          this.state.selectedWord.id,
          this.state.activeGloss,
          this.state.audioFileURLs
        );
        this.resetState();
      } else {
        // ... and user has selected new entry
        this.addNewWordAndReset();
      }
    } else {
      // New Vern is typed
      this.addNewWordAndReset();
    }
  }

  handleEnter(e: React.KeyboardEvent, checkGloss: boolean): void {
    if (!this.state.vernOpen && e.key === Key.Enter) {
      // The user can never submit a new entry without a vernacular
      if (this.state.newEntry.vernacular) {
        // The user can conditionally submit a new entry without a gloss
        if (this.state.activeGloss || !checkGloss) {
          this.addOrUpdateWord();
          this.focus(FocusTarget.Vernacular);
        } else {
          this.focus(FocusTarget.Gloss);
        }
      } else {
        this.focus(FocusTarget.Vernacular);
      }
    }
  }

  handleCloseVernDialog(selectedWordId?: string): void {
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

  handleCloseSenseDialog(senseIndex?: number): void {
    if (senseIndex === undefined) {
      this.setState({ selectedWord: undefined, vernOpen: true });
    } else if (senseIndex >= 0) {
      // SenseDialog can only be open when this.state.selectedWord is defined.
      const gloss = firstGlossText(this.state.selectedWord!.senses[senseIndex]);
      this.updateGlossField(gloss);
    } // The remaining case, senseIndex===-1, indicates new sense for the selectedWord.
    this.setState({ senseOpen: false });
  }

  autoCompleteCandidates(vernacular: string): string[] {
    // filter allVerns to those that start with vernacular
    // then map them into an array sorted by length and take the 2 shortest
    // and the rest longest (should make finding the long words easier)
    const scoredStartsWith: [string, number][] = [];
    const startsWith = this.props.allVerns.filter((vern: string) =>
      vern.startsWith(vernacular)
    );
    for (const v of startsWith) {
      scoredStartsWith.push([v, v.length]);
    }
    const keepers = scoredStartsWith
      .sort((a, b) => a[1] - b[1])
      .map((vern) => vern[0]);
    if (keepers.length > this.maxSuggestions) {
      keepers.splice(2, keepers.length - this.maxSuggestions);
    }
    return keepers;
  }

  updateSuggestedVerns(value?: string): void {
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

  render(): ReactElement {
    return (
      <Grid container id={idAffix} alignItems="center">
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
          <Grid item xs={12}>
            <VernWithSuggestions
              isNew
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
              vernacularLang={this.props.vernacularLang}
              textFieldId={`${idAffix}-vernacular`}
              onComponentDidUpdate={() =>
                this.conditionalFocus(FocusTarget.Vernacular)
              }
            />
            <VernDialog
              open={this.state.vernOpen}
              handleClose={(selectedWordId?: string) =>
                this.handleCloseVernDialog(selectedWordId)
              }
              vernacularWords={this.state.dupVernWords}
              analysisLang={this.props.analysisLang.bcp47}
            />
            {this.state.selectedWord && (
              <SenseDialog
                selectedWord={this.state.selectedWord}
                open={this.state.senseOpen}
                handleClose={(senseIndex?: number) =>
                  this.handleCloseSenseDialog(senseIndex)
                }
                analysisLang={this.props.analysisLang.bcp47}
              />
            )}
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
            isNew
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
            textFieldId={`${idAffix}-gloss`}
            onComponentDidUpdate={() =>
              this.conditionalFocus(FocusTarget.Gloss)
            }
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
          {!this.state.selectedWord?.id && (
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
          <DeleteEntry
            removeEntry={() => this.resetState()}
            buttonId={`${idAffix}-delete`}
          />
        </Grid>
        <Grid item xs={12} style={{ paddingLeft: theme.spacing(2) }}>
          <Typography variant="caption">
            <Translate id="addWords.pressEnter" />
          </Typography>
        </Grid>
      </Grid>
    );
  }
}
