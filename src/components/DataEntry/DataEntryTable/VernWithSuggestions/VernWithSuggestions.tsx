import { TextField } from "@material-ui/core";
import { Autocomplete } from "@material-ui/lab";
import React from "react";
import {
  LocalizeContextProps,
  Translate,
  withLocalize,
} from "react-localize-redux";

import { Word, simpleWord } from "../../../../types/word";
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

  updateSuggestedVerns(value?: string | null) {
    let suggestedVerns: string[] = [];
    if (value) {
      const sortedVerns: string[] = this.props.allVerns.sort(
        (a: string, b: string) =>
          this.suggestionFinder.getLevenshteinDistance(a, value) -
          this.suggestionFinder.getLevenshteinDistance(b, value)
      );
      suggestedVerns = sortedVerns.slice(0, this.maxSuggestions);
    }
    this.setState({ suggestedVerns });
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
            let dupVernWords: Word[] = this.props.updateVernField(
              this.props.vernacular
            );
            if (dupVernWords.length > 0) {
              this.setState({ vernOpen: true, dupVernWords });
            } else {
              this.props.updateWordId();
            }
            if (this.props.onBlur) {
              this.props.onBlur();
            }
          }}
          onChange={(_event, value) => {
            // onChange is triggered when an option is selected
            let dupVernWords: Word[] = [];
            let vernOpen: boolean = false;
            if (!value) {
              this.props.updateWordId();
              this.props.updateVernField("");
            } else {
              dupVernWords = this.props.updateVernField(value!);
              vernOpen = dupVernWords.length > 0;
              if (!vernOpen) {
                this.props.updateWordId();
              }
            }
            this.setState({ dupVernWords, vernOpen });
            this.updateSuggestedVerns(value);
          }}
          onInputChange={(_event, value) => {
            // onInputChange is triggered by typing
            const dupVernWords = this.props.updateVernField(value);
            this.setState({ dupVernWords });
            this.updateSuggestedVerns(value);
            this.props.updateWordId();
          }}
          onKeyUp={(e) => {
            if (!this.state.vernOpen) this.props.handleEnterAndTab(e);
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
              console.log("ID: " + selectedWordId);
              if (selectedWordId) {
                let selectedWord: Word = this.state.dupVernWords.find(
                  (word: Word) => word.id === selectedWordId
                )!;
                this.setState({
                  selectedWord,
                  senseOpen: selectedWordId !== "",
                }); //new entry id is an empty string
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
