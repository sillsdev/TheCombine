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
import SpellChecker from "utilities/spellChecker";
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
      filterOptions={(options) => options} // prevents a disappearing-options bug
      freeSolo // allows use of a typed entry not available as a drop-down option
      includeInputInList // allows arrow up/down out of the suggestions
      isOptionEqualToValue={() => false} // prevents automatic option highlighting
      options={spellChecker.getSpellingSuggestions(props.gloss)}
      value={props.gloss}
      onBlur={() => {
        if (props.onBlur) {
          props.onBlur();
        }
      }}
      onInputChange={(_e, newInputValue) => {
        props.updateGlossField(newInputValue.normalize("NFC"));
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
      renderOption={(liProps, option, { selected }) => (
        <LiWithFont
          {...liProps}
          analysis
          aria-selected={selected}
          key={option}
          lang={props.analysisLang.bcp47}
        >
          {SpellChecker.replaceAllButLastWordWithEllipses(option)}
        </LiWithFont>
      )}
      /* Even though `onKeyPress` is deprecated, we need to keep using it:
       * - `onKeyDown` doesn't work with spelling suggestion selection via Enter,
       * because the submission occurs before the selected suggestion is applied;
       * - `onKeyUp` doesn't work with VernDialog selection via Enter,
       * because the dialog closes before the key is released. */
      onKeyPress={(e: KeyboardEvent) => {
        if (e.key === Key.Enter) {
          props.handleEnter();
        }
      }}
    />
  );
}
