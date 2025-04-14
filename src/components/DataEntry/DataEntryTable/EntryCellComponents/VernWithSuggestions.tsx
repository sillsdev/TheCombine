import { Autocomplete, AutocompleteCloseReason } from "@mui/material";
import {
  type KeyboardEvent,
  type ReactElement,
  type RefObject,
  type SyntheticEvent,
  useEffect,
} from "react";
import { Key } from "ts-key-enum";

import { type WritingSystem } from "api/models";
import { LiWithFont, TextFieldWithFont } from "utilities/fontComponents";

interface VernWithSuggestionsProps {
  isNew?: boolean;
  isDisabled?: boolean;
  vernacular: string;
  vernInput?: RefObject<HTMLInputElement>;
  updateVernField: (newValue: string, openDialog?: boolean) => void;
  onBlur: () => void;
  onClose?: (e: SyntheticEvent, reason: AutocompleteCloseReason) => void;
  onFocus?: () => void;
  suggestedVerns?: string[];
  handleEnter: () => void;
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
      value={props.vernacular}
      options={props.suggestedVerns ?? []}
      freeSolo // allows use of a typed entry not available as a drop-down option
      includeInputInList // allows arrow up/down out of the suggestions
      isOptionEqualToValue={() => false} // prevents automatic option highlighting
      onBlur={props.onBlur}
      onFocus={props.onFocus}
      onInputChange={(_e, value) => {
        // Autocomplete doesn't use its renderInput's onChange,
        // so we need to normalize manually here.
        props.updateVernField(value.normalize("NFC"));
      }}
      onKeyPress={(e: KeyboardEvent) => {
        if (e.key === Key.Enter) {
          props.handleEnter();
        }
      }}
      onClose={props.onClose}
      renderInput={(params) => (
        <TextFieldWithFont
          {...(params as any)}
          fullWidth
          inputRef={props.vernInput}
          label={props.isNew ? props.vernacularLang.name : ""}
          variant={(props.isNew ? "outlined" : "standard") as any}
          vernacular
        />
      )}
      renderOption={(liProps, option, { selected }) => (
        <LiWithFont
          {...liProps}
          aria-selected={selected}
          key={option}
          vernacular
        >
          {option}
        </LiWithFont>
      )}
    />
  );
}
