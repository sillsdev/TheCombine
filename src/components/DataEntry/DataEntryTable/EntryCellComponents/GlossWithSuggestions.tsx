import { Autocomplete } from "@mui/material";
import React, { ReactElement, useContext, useEffect } from "react";
import { Key } from "ts-key-enum";

import { WritingSystem } from "api/models";
import { TextFieldWithFont } from "utilities/fontComponents";
import SpellCheckerContext from "utilities/spellCheckerContext";

interface GlossWithSuggestionsProps {
  isNew?: boolean;
  isDisabled?: boolean;
  gloss: string;
  glossInput?: React.RefObject<HTMLDivElement>;
  updateGlossField: (newValue: string) => void;
  handleEnterAndTab: (e: React.KeyboardEvent) => void;
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

  const maxSuggestions = 5;

  useEffect(() => {
    if (props.onUpdate) {
      props.onUpdate();
    }
  });

  return (
    <Autocomplete
      id={props.textFieldId}
      disabled={props.isDisabled}
      filterOptions={(options: unknown[]) =>
        options.length <= maxSuggestions
          ? options
          : options.slice(0, maxSuggestions)
      }
      // freeSolo allows use of a typed entry not available as a drop-down option
      freeSolo
      options={spellChecker.getSpellingSuggestions(props.gloss)}
      value={props.gloss}
      onBlur={() => {
        if (props.onBlur) {
          props.onBlur();
        }
      }}
      onChange={(_e, newValue) => {
        const newText = newValue ? (newValue as string) : "";
        props.updateGlossField(newText);
      }}
      inputValue={props.gloss}
      onInputChange={(_e, newInputValue) => {
        props.updateGlossField(newInputValue);
      }}
      renderInput={(params) => (
        <TextFieldWithFont
          {...params}
          analysis
          dir={props.analysisLang.rtl ? "rtl" : undefined}
          fullWidth
          inputRef={props.glossInput}
          label={props.isNew ? props.analysisLang.name : ""}
          lang={props.analysisLang.bcp47}
          variant={props.isNew ? "outlined" : "standard"}
        />
      )}
      onKeyPress={(e: React.KeyboardEvent) => {
        if (e.key === Key.Enter || e.key === Key.Tab) {
          e.preventDefault();
          props.handleEnterAndTab(e);
        }
      }}
    />
  );
}
