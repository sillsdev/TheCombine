import { Autocomplete } from "@mui/material";
import React, { ReactElement, useContext, useEffect, useState } from "react";
import { Key } from "ts-key-enum";

import { WritingSystem } from "api/models";
import { TextFieldWithFont } from "utilities/fontComponents";
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

  const [pressableEnter, setPressableEnter] = useState(true);
  const [pressingEnter, setPressingEnter] = useState(false);
  const [pressedEnter, setPressedEnter] = useState(false);

  const { gloss, handleEnter } = props;
  const maxSuggestions = 5;

  useEffect(() => {
    if (props.onUpdate) {
      props.onUpdate();
    }
  });

  // Trigger handleEnter when Enter is onKeyUp; this allows a user's spelling suggestion
  // selection to update the gloss value.
  // However, only trigger it if Enter was here for onKeyDown; this prevents an Enter
  // started in the SenseDialog and ended here from submitting the new word.
  useEffect(() => {
    if (pressedEnter && pressableEnter) {
      if (pressingEnter) {
        handleEnter();
        setPressableEnter(false);
        setPressingEnter(false);
      } else {
        setPressedEnter(false);
      }
    }
  }, [handleEnter, pressableEnter, pressedEnter, pressingEnter]);
  // pressableEnter is used to prevent double-submitting;
  // it needs to be reset when the gloss is cleared.
  useEffect(() => {
    if (!gloss) {
      setPressedEnter(false);
      setPressingEnter(false);
      setPressableEnter(true);
    }
  }, [gloss, pressableEnter]);

  return (
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
      onKeyDown={(e: React.KeyboardEvent) => {
        if (e.key === Key.Enter && !pressedEnter && pressableEnter) {
          setPressingEnter(true);
        }
      }}
      onKeyUp={(e: React.KeyboardEvent) => {
        if (e.key === Key.Enter && pressableEnter) {
          setPressedEnter(true);
        }
      }}
    />
  );
}
