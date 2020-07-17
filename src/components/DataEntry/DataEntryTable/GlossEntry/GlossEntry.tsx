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
}

/**
 * An editable gloss field that suggests spellings when current word isn't recognized.
 */
export class GlossEntry extends React.Component<
  GlossEntryProps & LocalizeContextProps
> {
  spellChecker = new SpellChecker();
  render() {
    return (
      <Autocomplete
        filterOptions={(options: unknown[]) => options}
        freeSolo
        options={this.spellChecker.getSpellingSuggestions(this.props.gloss)}
        value={this.props.gloss}
        onChange={(event, newValue) => {
          this.props.updateGlossField(newValue ? (newValue as string) : "");
        }}
        inputValue={this.props.gloss}
        onInputChange={(event, newInputValue) => {
          this.props.updateGlossField(
            newInputValue ? (newInputValue as string) : ""
          );
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
