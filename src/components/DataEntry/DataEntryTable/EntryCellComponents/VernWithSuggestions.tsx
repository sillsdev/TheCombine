import {
  Autocomplete,
  AutocompleteCloseReason,
  TextField,
} from "@mui/material";
import React, { ReactElement, useEffect } from "react";
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
  onUpdate?: () => void;
}

/**
 * An editable vernacular field for new words, that suggests words already in database.
 */
export default function VernWithSuggestions(
  props: VernWithSuggestionsProps
): ReactElement {
  useEffect(() => {
    if (props.onUpdate) {
      props.onUpdate();
    }
  });

  return (
    <Autocomplete
      id={props.textFieldId}
      disabled={props.isDisabled}
      // freeSolo allows use of a typed entry not available as a drop-down option
      freeSolo
      value={props.vernacular}
      options={props.suggestedVerns ?? []}
      onBlur={props.onBlur}
      onChange={(_e, value) => {
        // onChange is triggered when an option is selected
        props.updateVernField(value ?? "", true);
      }}
      onInputChange={(_e, value) => {
        // onInputChange is triggered by typing
        props.updateVernField(value);
      }}
      onKeyPress={(e: React.KeyboardEvent) => {
        if (e.key === Key.Enter || e.key === Key.Tab) {
          e.preventDefault();
          props.handleEnterAndTab(e);
        }
      }}
      onClose={props.onClose}
      renderInput={(params) => (
        <TextField
          {...params}
          fullWidth
          inputRef={props.vernInput}
          label={props.isNew ? props.vernacularLang.name : ""}
          variant={props.isNew ? "outlined" : "standard"}
        />
      )}
    />
  );
}
