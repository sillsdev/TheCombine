import { Grid, Typography } from "@material-ui/core";
import React from "react";
import { Translate } from "react-localize-redux";

import DupFinder, {
  DefaultParams,
} from "../../../../goals/MergeDupGoal/DuplicateFinder/DuplicateFinder";
import theme from "../../../../types/theme";
import { SemanticDomain, simpleWord, Word } from "../../../../types/word";
import Pronunciations from "../../../Pronunciations/PronunciationsComponent";
import Recorder from "../../../Pronunciations/Recorder";
import GlossWithSuggestions from "../GlossWithSuggestions/GlossWithSuggestions";
import VernWithSuggestions from "../VernWithSuggestions/VernWithSuggestions";
import SenseDialog from "./SenseDialog";
import VernDialog from "./VernDialog";

interface NewEntryProps {
  allVerns: string[];
  allWords: Word[];
  defunctWordIds: string[];
  updateWordWithNewGloss: (
    wordId: string,
    gloss: string,
    audioFileURLs: string[]
  ) => void;
  addNewWord: (newWord: Word, newAudio: string[]) => void;
  semanticDomain: SemanticDomain;
  setIsReadyState: (isReady: boolean) => void;
  recorder?: Recorder;
  analysisLang: string;
}

interface NewEntryState {
  newEntry: Word;
  isDupVern: boolean;
  wordId?: string;
  activeGloss: string;
  audioFileURLs: string[];
  vernOpen: boolean;
  senseOpen: boolean;
  suggestedVerns: string[];
  dupVernWords: Word[];
  selectedWord: Word;
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
  readonly maxSuggestions = 5;
  readonly maxLevDistance = 3; // The default 5 allows too much distance
  suggestionFinder: DupFinder = new DupFinder({
    ...DefaultParams,
    maxScore: this.maxLevDistance,
  });

  constructor(props: NewEntryProps) {
    super(props);
    this.state = {
      newEntry: { ...simpleWord("", ""), id: "" },
      activeGloss: "",
      audioFileURLs: [],
      isDupVern: false,
      vernOpen: false,
      senseOpen: false,
      suggestedVerns: [],
      dupVernWords: [],
      selectedWord: { ...simpleWord("", ""), id: "" },
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
    const newEntry = {
      ...this.state.newEntry,
      senses: [
        {
          glosses: [{ language: this.props.analysisLang, def: newValue }],
          semanticDomains: [this.props.semanticDomain],
        },
      ],
    };
    this.setState({ newEntry, activeGloss: newValue });
  }

  updateVernField(newValue: string, openDialog?: boolean) {
    this.props.setIsReadyState(newValue.trim().length > 0);
    let dupVernWords: Word[] = [];
    let isDupVern: boolean = false;
    if (newValue) {
      dupVernWords = this.props.allWords.filter(
        (word: Word) =>
          word.vernacular === newValue &&
          !this.props.defunctWordIds.includes(word.id)
        // Weed out any words that are already being edited
      );
      isDupVern = dupVernWords.length > 0;
    }
    const newEntry = { ...this.state.newEntry, vernacular: newValue };
    this.setState({ isDupVern, newEntry });
    this.updateSuggestedVerns(newValue);
    if (openDialog && isDupVern) {
      this.setState({ vernOpen: true, dupVernWords });
    } else {
      this.updateWordId();
    }
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
    this.props.addNewWord(this.state.newEntry, this.state.audioFileURLs);
    this.resetState();
  }

  updateWordAndReset() {
    this.props.updateWordWithNewGloss(
      this.state.wordId!,
      this.state.activeGloss,
      this.state.audioFileURLs
    );
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
      this.updateWordAndReset();
    }
  }

  async handleEnterAndTab(e: React.KeyboardEvent) {
    if (!this.state.vernOpen && e.key === "Enter") {
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

  openDialog() {
    this.setState({ vernOpen: true });
  }

  handleCloseVernDialog(selectedWordId?: string) {
    this.setState({ vernOpen: false }, () => {
      this.updateWordId(selectedWordId);
    });
    if (selectedWordId) {
      let selectedWord: Word = this.state.dupVernWords.find(
        (word: Word) => word.id === selectedWordId
      )!;
      this.setState({
        selectedWord,
        senseOpen: true,
      });
    } else if (selectedWordId === "") {
      let selectedWord: Word = {
        ...simpleWord(this.state.newEntry.vernacular, ""),
        id: "",
      };
      this.setState({ selectedWord });
    }
  }

  handleCloseSenseDialog(senseIndex?: number) {
    if (senseIndex === undefined) {
      this.updateWordId();
      this.setState({
        selectedWord: { ...simpleWord("", ""), id: "" },
        vernOpen: true,
      });
    } else if (senseIndex >= 0) {
      const activeGloss = this.state.selectedWord.senses[senseIndex].glosses[0]
        .def;
      this.setState({ activeGloss });
    }
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
            this.suggestionFinder.getLevenshteinDistance(vern, value) <
            this.suggestionFinder.maxScore
        );
        const sortedVerns: string[] = viableVerns.sort(
          (a: string, b: string) =>
            this.suggestionFinder.getLevenshteinDistance(a, value) -
            this.suggestionFinder.getLevenshteinDistance(b, value)
        );
        let candidate: string;
        while (
          suggestedVerns.length < this.maxSuggestions &&
          sortedVerns.length
        ) {
          candidate = sortedVerns.shift()!;
          if (!suggestedVerns.includes(candidate))
            suggestedVerns.push(candidate);
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
                  this.updateVernField(
                    this.state.newEntry.vernacular,
                    this.state.wordId === undefined && this.state.isDupVern
                  );
                }}
                suggestedVerns={this.state.suggestedVerns}
                handleEnterAndTab={(e: React.KeyboardEvent) =>
                  this.handleEnterAndTab(e)
                }
              />
              <VernDialog
                open={this.state.vernOpen}
                handleClose={(selectedWordId?: string) =>
                  this.handleCloseVernDialog(selectedWordId)
                }
                vernacularWords={this.state.dupVernWords}
                analysisLang={this.props.analysisLang}
              />
              <SenseDialog
                selectedWord={this.state.selectedWord}
                open={this.state.senseOpen}
                handleClose={(senseIndex?: number) =>
                  this.handleCloseSenseDialog(senseIndex)
                }
                analysisLang={this.props.analysisLang}
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
              analysisLang={this.props.analysisLang}
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
