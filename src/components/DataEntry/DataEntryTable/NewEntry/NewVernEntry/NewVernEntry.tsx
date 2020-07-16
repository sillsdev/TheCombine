import React from "react";
import { TextField, Tooltip } from "@material-ui/core";
import { Autocomplete } from "@material-ui/lab";
import { Word } from "../../../../../types/word";
import { AutoComplete } from "../../../../../types/AutoComplete";
import {
  Translate,
  LocalizeContextProps,
  withLocalize,
} from "react-localize-redux";

interface NewVernEntryProps {
  vernacular: string;
  newEntry: Word;
  showAutocompleteToggle: boolean;
  autocompleteSetting: AutoComplete;
  vernInput: React.RefObject<HTMLDivElement>;
  allWords: Word[];
  toggleAutocompleteView: () => void;
  updateNewEntry: (newEntry: Word) => void;
}
interface NewVernEntryState {
  duplicates: Word[];
}

/**
 * An editable vernacular field for new words that indicates whether the
 * vernacular already exists in a collection
 */
export class NewVernEntry extends React.Component<
  LocalizeContextProps & NewVernEntryProps & NewVernEntryState
> {
  render() {
    return (
      <div>
        {/* <TextField
          autoFocus
          id="newvernentry"
          label={<Translate id="addWords.vernacular" />}
          fullWidth
          variant="outlined"
          value={this.props.vernacular}
          onChange={(e) => this.props.updateVernField(e.target.value)}
          inputRef={this.props.vernInput}
        /> */}
        <Autocomplete
          freeSolo
          fullWidth
          id="newvernentry"
          value={this.props.vernacular}
          options={this.props.allWords.map((dup) => dup.vernacular)}
          renderInput={(params) => (
            <TextField
              {...params}
              label={<Translate id="addWords.vernacular" />}
              margin="normal"
              variant="outlined"
            />
          )}
        />
        {this.props.showAutocompleteToggle && (
          <Tooltip
            title={<Translate id="addWords.wordInDatabase" />}
            placement="top"
          >
            <div
              style={{
                height: "5px",
                width: "5px",
                border: "2px solid red",
                borderRadius: "50%",
                position: "absolute",
                top: 24,
                right: 48,
                cursor: "pointer",
              }}
              onClick={() => this.props.toggleAutocompleteView()}
            />
          </Tooltip>
        )}
      </div>
    );
  }
}

export default withLocalize(NewVernEntry);
