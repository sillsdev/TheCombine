import { TextField } from "@material-ui/core";
import { Autocomplete, AutocompleteCloseReason } from "@material-ui/lab";
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
  onClose?: (e: React.ChangeEvent<{}>, reason: AutocompleteCloseReason) => void;
  suggestedVerns?: string[];
  handleEnterAndTab: (e: React.KeyboardEvent) => void;
  vernacularLang: WritingSystem;
  textFieldId: string;
  onComponentDidUpdate?: () => void;
}

/**
 * An editable vernacular field for new words, that suggests words already in database.
 */
export default class VernWithSuggestions extends React.Component<VernWithSuggestionsProps> {
  componentDidUpdate() {
    if (this.props.onComponentDidUpdate) {
      this.props.onComponentDidUpdate();
    }
  }

  render() {
    return (
      <React.Fragment>
        <Autocomplete
          id={this.props.textFieldId}
          disabled={this.props.isDisabled}
          // freeSolo allows use of a typed entry not available as a drop-down option
          freeSolo
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
          onClose={this.props.onClose}
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
