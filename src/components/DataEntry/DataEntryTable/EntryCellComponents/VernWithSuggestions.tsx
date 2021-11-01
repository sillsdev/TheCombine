import { TextField } from "@material-ui/core";
import { Autocomplete } from "@material-ui/lab";
import React from "react";
import { Key } from "ts-key-enum";

import { WritingSystem } from "api";

interface VernWithSuggestionsProps {
  isNew?: boolean;
  isDisabled?: boolean;
  vernacular: string;
  vernInput?: React.RefObject<HTMLDivElement>;
  updateVernField: (newValue: string, openDialog?: boolean) => void;
  onBlur: () => void;
  suggestedVerns?: string[];
  handleEnterAndTab: (e: React.KeyboardEvent) => void;
  vernacularLang: WritingSystem;
  textFieldId: string;
}

/**
 * An editable vernacular field for new words, that suggests words already in database.
 */
export default class VernWithSuggestions extends React.Component<VernWithSuggestionsProps> {
  render() {
    return (
      <React.Fragment>
        <Autocomplete
          id={this.props.textFieldId}
          freeSolo
          disabled={this.props.isDisabled}
          value={this.props.vernacular}
          options={this.props.suggestedVerns ? this.props.suggestedVerns : []}
          onBlur={this.props.onBlur}
          onChange={(_e, value) => {
            // onChange is triggered when an option is selected
            if (!value) {
              value = "";
            }
            this.props.updateVernField(value, true);
          }}
          onInputChange={(_event, value) => {
            // onInputChange is triggered by typing
            this.props.updateVernField(value);
          }}
          onKeyPress={(e: React.KeyboardEvent) => {
            if (e.key === Key.Enter || e.key === Key.Tab) {
              this.props.handleEnterAndTab(e);
            }
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              fullWidth
              inputRef={this.props.vernInput}
              label={this.props.isNew ? this.props.vernacularLang.name : ""}
              variant={this.props.isNew ? "outlined" : "standard"}
            />
          )}
        />
      </React.Fragment>
    );
  }
}
