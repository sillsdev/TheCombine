import { TextField } from "@material-ui/core";
import { Autocomplete } from "@material-ui/lab";
import React from "react";
import {
  LocalizeContextProps,
  Translate,
  withLocalize,
} from "react-localize-redux";

import DupFinder from "../../../../goals/MergeDupGoal/DuplicateFinder/DuplicateFinder";

interface VernWithSuggestionsProps {
  isNew?: boolean;
  isDisabled?: boolean;
  vernacular: string;
  vernInput?: React.RefObject<HTMLDivElement>;
  updateVernField: (newValue: string) => boolean;
  allVerns: string[];
  handleEnterAndTab: (e: React.KeyboardEvent) => void;
  updateWordId: (wordId?: string) => void;
  selectedWordId?: string;
  onBlur?: () => void;
  openVernDialog?: () => void;
}

interface VernWithSuggestionsState {
  vernOpen: boolean;
  suggestedVerns: string[];
}

/**
 * An editable vernacular field that suggests existing entries
 * with the same or similar vernacular
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
      suggestedVerns: [],
    };
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

  handleSelection(value: string) {
    const isDupVern: boolean = this.props.updateVernField(value);
    if (isDupVern && this.props.openVernDialog) {
      this.props.openVernDialog();
    } else {
      this.props.updateWordId();
    }
  }

  render() {
    return (
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
          this.props.updateVernField(value);
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
    );
  }
}

export default withLocalize(VernWithSuggestions);
