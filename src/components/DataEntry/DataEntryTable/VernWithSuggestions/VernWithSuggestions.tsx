import { TextField } from "@material-ui/core";
import { Autocomplete } from "@material-ui/lab";
import React from "react";
import {
  LocalizeContextProps,
  Translate,
  withLocalize,
} from "react-localize-redux";

import { simpleWord, Word } from "../../../../types/word";
import DupFinder from "../../../../goals/MergeDupGoal/DuplicateFinder/DuplicateFinder";
import SenseDialog from "./SenseDialog/SenseDialog";
import VernDialog from "./VernDialog/VernDialog";

interface VernWithSuggestionsProps {
  isNew?: boolean;
  isDisabled?: boolean;
  vernacular: string;
  vernInput?: React.RefObject<HTMLDivElement>;
  updateVernField: (newValue: string) => Word[];
  setActiveGloss: (newGloss: string) => void;
  allVerns: string[];
  handleEnterAndTab: (e: React.KeyboardEvent) => void;
  updateWordId: (wordId?: string) => void;
  selectedWordId?: string;
  onBlur?: () => void;
}

interface VernWithSuggestionsState {
  vernOpen: boolean;
  senseOpen: boolean;
  suggestedVerns: string[];
  dupVernWords: Word[];
  selectedWord: Word;
}

/**
 * An editable vernacular field for new words
 */
export class VernWithSuggestions extends React.Component<
  LocalizeContextProps & VernWithSuggestionsProps,
  VernWithSuggestionsState
> {
  readonly maxSuggestions = 5;
  suggestionFinder: DupFinder = new DupFinder();

  constructor(props: any) {
    super(props);
    this.state = {
      vernOpen: false,
      senseOpen: false,
      suggestedVerns: [],
      dupVernWords: [],
      selectedWord: { ...simpleWord("", ""), id: "" },
    };
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
        let sortedVerns: string[] = [...this.props.allVerns].sort(
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

  handleSelection(value: string) {
    let dupVernWords: Word[] = this.props.updateVernField(value);
    if (dupVernWords.length > 0) {
      this.setState({ vernOpen: true, dupVernWords });
    } else {
      this.props.updateWordId();
    }
  }

  render() {
    return (
      <React.Fragment>
        <Autocomplete
          freeSolo
          disabled={this.props.isDisabled}
          value={this.props.vernacular}
          options={this.state.suggestedVerns}
          onBlur={(_event: React.FocusEvent<HTMLDivElement>) => {
            if (this.props.onBlur) {
              this.props.onBlur();
            }
            if (this.props.selectedWordId === undefined)
              this.handleSelection(this.props.vernacular);
          }}
          onChange={(_event, value) => {
            // onChange is triggered when an option is selected
            if (!value) value = "";
            this.handleSelection(value);
            this.updateSuggestedVerns(value);
          }}
          onInputChange={(_event, value) => {
            // onInputChange is triggered by typing
            const dupVernWords = this.props.updateVernField(value);
            this.setState({ dupVernWords });
            this.updateSuggestedVerns(value);
            this.props.updateWordId();
          }}
          onKeyPress={(e: React.KeyboardEvent) => {
            if (!this.state.vernOpen && (e.key === "Enter" || e.key === "Tab"))
              this.props.handleEnterAndTab(e);
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              fullWidth
              inputRef={this.props.vernInput}
              label={
                this.props.isNew ? <Translate id="addWords.vernacular" /> : ""
              }
              variant={this.props.isNew ? "outlined" : "standard"}
            />
          )}
        />
        {this.props.isNew && (
          <VernDialog
            open={this.state.vernOpen}
            handleClose={(selectedWordId?: string) => {
              this.setState({ vernOpen: false }, () => {
                this.props.updateWordId(selectedWordId);
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
                  ...simpleWord(this.props.vernacular, ""),
                  id: "",
                };
                this.setState({ selectedWord });
              }
            }}
            vernacularWords={this.state.dupVernWords}
          />
        )}
        {this.props.isNew && (
          <SenseDialog
            selectedWord={this.state.selectedWord}
            open={this.state.senseOpen}
            handleClose={(senseIndex: number) => {
              if (senseIndex >= 0) {
                this.props.setActiveGloss(
                  this.state.selectedWord.senses[senseIndex].glosses[0].def
                );
              }
              this.setState({ senseOpen: false });
            }}
          />
        )}
      </React.Fragment>
    );
  }
}

export default withLocalize(VernWithSuggestions);
