import React from "react";
import { TextField } from "@material-ui/core";
import { Autocomplete } from "@material-ui/lab";
import {
  LocalizeContextProps,
  Translate,
  withLocalize,
} from "react-localize-redux";

import SpellChecker from "../../spellChecker";

interface GlossEntryProps {
  gloss: string;
  glossInput?: React.RefObject<HTMLDivElement>;
  updateGlossField: (newValue: string) => void;
  onBlur?: (newValue: string) => void;
}

/**
 * An editable gloss field that suggests spellings when current word isn't recognized.
 */
export class GlossEntry extends React.Component<
  GlossEntryProps & LocalizeContextProps
> {
  readonly maxSuggestions = 5;

  spellChecker = new SpellChecker();
  render() {
    return (
      <Autocomplete
        filterOptions={(options: unknown[]) =>
          options.length <= this.maxSuggestions
            ? options
            : options.slice(0, this.maxSuggestions)
        }
        freeSolo
        options={this.spellChecker.getSpellingSuggestions(this.props.gloss)}
        value={this.props.gloss}
        onBlur={() => {
          if (this.props.onBlur) this.props.onBlur(this.props.gloss);
        }}
        onChange={(event, newValue) => {
          const newText = newValue ? (newValue as string) : "";
          this.props.updateGlossField(newText);
        }}
        inputValue={this.props.gloss}
        onInputChange={(event, newInputValue) => {
          this.props.updateGlossField(newInputValue);
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            label={<Translate id="addWords.glosses" />}
            fullWidth
            variant="outlined"
            inputRef={this.props.glossInput}
          />
        )}
      />
    );
  }
}

export default withLocalize(GlossEntry);
