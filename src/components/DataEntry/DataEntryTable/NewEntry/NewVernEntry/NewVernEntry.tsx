import React from "react";
import { Popper, TextField, Tooltip, Typography } from "@material-ui/core";
import { Autocomplete } from "@material-ui/lab";
import { Word } from "../../../../../types/word";
import { shade } from "../../../../../types/theme";
import { AutoComplete } from "../../../../../types/AutoComplete";
import {
  Translate,
  LocalizeContextProps,
  withLocalize,
} from "react-localize-redux";

interface NewVernEntryProps {
  vernacular: string;
  newEntry: Word;
  showAutocompleteToggle: boolean;
  autocompleteSetting: AutoComplete;
  vernInput: React.RefObject<HTMLDivElement>;
  allWords: Word[];
  toggleAutocompleteView: () => void;
  updateNewEntry: (newEntry: Word) => void;
}
interface NewVernEntryState {
  duplicates: Word[];
}
function OptionComponent(option: Word) {
  return (
    <React.Fragment>
      {option.vernacular}
      {" | "}
      {option.senses[0].glosses.map((gloss) => gloss.def)}
      {" | "}
      {option.senses[0].semanticDomains.map((domain) => (
        <React.Fragment>
          <Typography style={{ background: shade, borderRadius: "15px" }}>
            {domain.id}: {domain.name}
          </Typography>
        </React.Fragment>
      ))}
    </React.Fragment>
  );
}
/**
 * An editable vernacular field for new words that indicates whether the
 * vernacular already exists in a collection
 */
export class NewVernEntry extends React.Component<
  LocalizeContextProps & NewVernEntryProps & NewVernEntryState
> {
  render() {
    const CustomDropdown = function (props: any) {
      return (
        <Popper {...props} style={{ width: 600 }} placement="bottom-start" />
      );
    };
    return (
      <div>
        <Autocomplete
          freeSolo
          PopperComponent={CustomDropdown}
          id="newvernentry"
          value={this.props.vernacular}
          options={this.props.allWords.map((dup) => dup)}
          getOptionLabel={(option) => option.vernacular}
          renderOption={(option, state) => OptionComponent(option)}
          renderInput={(params) => (
            <TextField
              {...params}
              label={<Translate id="addWords.vernacular" />}
              variant="outlined"
              fullWidth
            />
          )}
        />
        {this.props.showAutocompleteToggle && (
          <Tooltip
            title={<Translate id="addWords.wordInDatabase" />}
            placement="top"
          >
            <div
              style={{
                height: "5px",
                width: "5px",
                border: "2px solid red",
                borderRadius: "50%",
                position: "absolute",
                top: 24,
                right: 48,
                cursor: "pointer",
              }}
              onClick={() => this.props.toggleAutocompleteView()}
            />
          </Tooltip>
        )}
      </div>
    );
  }
}

export default withLocalize(NewVernEntry);
