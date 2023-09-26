import { Autocomplete } from "@mui/material";
import React, { ReactElement, useContext, useEffect, useRef } from "react";
import { Key } from "ts-key-enum";
import typeahead from "typeahead-standalone";
import "typeahead-standalone/dist/basic.css";

import { WritingSystem } from "api/models";
import { LiWithFont, TextFieldWithFont } from "utilities/fontComponents";
import SpellCheckerContext from "utilities/spellCheckerContext";

interface GlossWithSuggestionsProps {
  isNew?: boolean;
  isDisabled?: boolean;
  gloss: string;
  glossInput?: React.RefObject<HTMLInputElement>;
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

  const maxSuggestions = 5;

  useEffect(() => {
    if (props.onUpdate) {
      props.onUpdate();
    }
  });

  return (
    <>
      <Autocomplete
        id={props.textFieldId}
        disabled={props.isDisabled}
        filterOptions={(options: string[]) =>
          options.length <= maxSuggestions
            ? options
            : options.slice(0, maxSuggestions)
        }
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
            {...params}
            analysis
            fullWidth
            inputRef={props.glossInput}
            label={props.isNew ? props.analysisLang.name : ""}
            lang={props.analysisLang.bcp47}
            variant={props.isNew ? "outlined" : "standard"}
          />
        )}
        renderOption={(liProps, option, { selected }) => (
          <LiWithFont
            {...liProps}
            analysis
            aria-selected={selected}
            lang={props.analysisLang.bcp47}
          >
            {option}
          </LiWithFont>
        )}
        onKeyPress={(e: React.KeyboardEvent) => {
          if (e.key === Key.Enter) {
            props.handleEnter();
          }
        }}
      />
      <div style={{ height: 50 }} />
      <LookAhead dict={spellChecker.dictLoaded} />
    </>
  );
}

function LookAhead(props: { dict: string[] }): ReactElement {
  const inputRef = useRef<HTMLDivElement | null>(null);
  if (inputRef.current) {
    console.info(props.dict.length);
    typeahead({
      input: document.getElementById("test") as HTMLInputElement,
      source: {
        local: props.dict,
      },
    });
  }

  return (
    <div ref={inputRef}>
      <input autoComplete="off" id="test" type="search" />
    </div>
  );
}
