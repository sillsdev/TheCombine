import { TextField } from "@material-ui/core";
import { Autocomplete } from "@material-ui/lab";
import React from "react";
import {
  LocalizeContextProps,
  Translate,
  withLocalize,
} from "react-localize-redux";

import SpellChecker from "../../spellChecker";

interface GlossWithSuggestionsProps {
  gloss: string;
  glossInput?: React.RefObject<HTMLDivElement>;
  updateGlossField: (newValue: string) => void;
  onBlur?: (newValue: string) => void;
}

/**
 * An editable gloss field that suggests spellings when current word isn't recognized.
 */
export class GlossWithSuggestions extends React.Component<
  GlossWithSuggestionsProps & LocalizeContextProps
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
        // freeSolo allows use of a typed entry not available as a drop-down option
        freeSolo
        options={this.spellChecker.getSpellingSuggestions(this.props.gloss)}
        value={this.props.gloss}
        onBlur={() => {
          if (this.props.onBlur) this.props.onBlur(this.props.gloss);
        }}
        onChange={(e, newValue) => {
          const newText = newValue ? (newValue as string) : "";
          this.props.updateGlossField(newText);
        }}
        inputValue={this.props.gloss}
        onInputChange={(e, newInputValue) => {
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

export default withLocalize(GlossWithSuggestions);
