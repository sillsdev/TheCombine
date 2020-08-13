import { TextField } from "@material-ui/core";
import { Autocomplete } from "@material-ui/lab";
import React from "react";
import {
  LocalizeContextProps,
  Translate,
  withLocalize,
} from "react-localize-redux";

import { Word } from "../../../../types/word";
import DupFinder from "../../../../goals/MergeDupGoal/DuplicateFinder/DuplicateFinder";
import VernDialog from "./VernDialog/VernDialog";

interface VernWithSuggestionsProps {
  isNew?: boolean;
  vernacular: string;
  vernInput?: React.RefObject<HTMLDivElement>;
  updateVernField: (newValue: string) => Word[];
  allVerns: string[];
  handleEnter: (e: React.KeyboardEvent) => void;
  updateWordId: (wordId?: string) => void;
  onBlur?: () => void;
}
interface VernWithSuggestionsState {
  open: boolean;
  suggestedVerns: string[];
  dupVernWords: Word[];
  selectedVernacular?: string;
}

/**
 * An editable vernacular field for new words
 */
export class VernWithSuggestions extends React.Component<
  LocalizeContextProps & VernWithSuggestionsProps,
  VernWithSuggestionsState
> {
  readonly maxSuggestions = 5;
  vernListRef: React.RefObject<HTMLDivElement>;
  suggestionFinder: DupFinder = new DupFinder();

  constructor(props: any) {
    super(props);
    this.state = {
      open: false,
      suggestedVerns: [],
      dupVernWords: [],
    };
    this.vernListRef = React.createRef();
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

  selectWord(word: Word) {
    this.props.updateWordId(word.id);
    this.setState({ selectedVernacular: word.vernacular });
  }

  clearSelectedWord() {
    this.props.updateWordId();
    this.setState({ selectedVernacular: undefined });
  }

  render() {
    return (
      <div>
        <Autocomplete
          freeSolo
          id="newvernentry"
          value={this.props.vernacular}
          options={this.state.suggestedVerns}
          onBlur={(_event: React.FocusEvent<HTMLDivElement>) => {
            let dupVernWords: Word[] = this.props.updateVernField(
              this.props.vernacular
            );
            if (dupVernWords.length > 0) {
              this.setState({ open: true, dupVernWords });
            } else {
              this.clearSelectedWord();
            }
            if (this.props.onBlur) {
              this.props.onBlur();
            }
          }}
          onChange={(_event, value) => {
            // onChange is triggered when an option is selected
            let dupVernWords: Word[] = [];
            let open: boolean = false;
            if (!value) {
              this.clearSelectedWord();
              this.props.updateVernField("");
            } else {
              dupVernWords = this.props.updateVernField(value!);
              open = dupVernWords.length > 0;
              if (!open) {
                this.clearSelectedWord();
              }
            }
            this.setState({ dupVernWords, open });
            this.updateSuggestedVerns(value);
          }}
          onInputChange={(_event, value) => {
            // onInputChange is triggered by typing
            const dupVernWords = this.props.updateVernField(value);
            this.setState({ dupVernWords });
            this.updateSuggestedVerns(value);
            if (value !== this.state.selectedVernacular) {
              this.clearSelectedWord();
            }
          }}
          onKeyDown={(e) => {
            if (!this.state.open) this.props.handleEnter(e);
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
        <VernDialog
          open={this.state.open}
          handleClose={(selectedWord?: Word) => {
            this.setState({ open: false });
            if (selectedWord) {
              this.selectWord(selectedWord);
            } else {
              this.clearSelectedWord();
            }
          }}
          vernacularWords={this.state.dupVernWords}
          vernListRef={this.vernListRef}
        />
      </div>
    );
  }
}

export default withLocalize(VernWithSuggestions);
