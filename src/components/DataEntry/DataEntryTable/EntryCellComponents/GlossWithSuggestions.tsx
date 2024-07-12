import { Autocomplete } from "@mui/material";
import {
  type KeyboardEvent,
  type ReactElement,
  type RefObject,
  useContext,
  useEffect,
} from "react";
import { Key } from "ts-key-enum";

import { type WritingSystem } from "api/models";
import { LiWithFont, TextFieldWithFont } from "utilities/fontComponents";
import SpellCheckerContext from "utilities/spellCheckerContext";

interface GlossWithSuggestionsProps {
  isNew?: boolean;
  isDisabled?: boolean;
  gloss: string;
  glossInput?: RefObject<HTMLInputElement>;
  updateGlossField: (newValue: string) => void;
  handleEnter: () => void;
  onBlur?: () => void;
  analysisLang: WritingSystem;
  textFieldId: string;
  onUpdate?: () => void;
}

/**
 * An editable gloss field that suggests spellings when current word isn't recognized.
 */
export default function GlossWithSuggestions(
  props: GlossWithSuggestionsProps
): ReactElement {
  const spellChecker = useContext(SpellCheckerContext);

  useEffect(() => {
    if (props.onUpdate) {
      props.onUpdate();
    }
  });

  return (
    <Autocomplete
      id={props.textFieldId}
      disabled={props.isDisabled}
      // there's a bug with disappearing options if filterOptions isn't specified
      filterOptions={(options) => options}
      // freeSolo allows use of a typed entry not available as a drop-down option
      freeSolo
      includeInputInList
      // option-never-equals-value prevents automatic option highlighting
      isOptionEqualToValue={() => false}
      options={spellChecker.getSpellingSuggestions(props.gloss)}
      value={props.gloss}
      onBlur={() => {
        if (props.onBlur) {
          props.onBlur();
        }
      }}
      onChange={(_e, newValue) => {
        // onChange is triggered when an option is selected
        props.updateGlossField(newValue ?? "");
      }}
      inputValue={props.gloss}
      onInputChange={(_e, newInputValue) => {
        // onInputChange is triggered by typing
        props.updateGlossField(newInputValue);
      }}
      renderInput={(params) => (
        <TextFieldWithFont
          {...(params as any)}
          analysis
          fullWidth
          inputRef={props.glossInput}
          label={props.isNew ? props.analysisLang.name : ""}
          lang={props.analysisLang.bcp47}
          variant={(props.isNew ? "outlined" : "standard") as any}
        />
      )}
      renderOption={(liProps, option, { selected }) => {
        // Split by non-letter/-mark/-number characters, as done in spellChecker.ts
        const words = option.split(/[^\p{L}\p{M}\p{N}]/u);
        // Find the last non-letter/-mark/-number character
        // It won't be after the last word--all those were trimmed by the spell checker
        const sep = option.match(/[^\p{L}\p{M}\p{N}]/gu)?.pop();
        return (
          <LiWithFont
            {...liProps}
            analysis
            aria-selected={selected}
            lang={props.analysisLang.bcp47}
          >
            {words.length > 1 ? `...${sep}${words[words.length - 1]}` : option}
          </LiWithFont>
        );
      }}
      onKeyPress={(e: KeyboardEvent) => {
        if (e.key === Key.Enter) {
          props.handleEnter();
        }
      }}
    />
  );
}
