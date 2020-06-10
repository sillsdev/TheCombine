import React from "react";
import { TextField, Tooltip } from "@material-ui/core";

import {
  Translate,
  LocalizeContextProps,
  withLocalize,
} from "react-localize-redux";

interface NewVernEntryProps {
  vernacular: string;
  showAutocompleteToggle: boolean;
  vernInput: React.RefObject<HTMLDivElement>;
  toggleAutocompleteView: () => void;
  updateVernField: (newValue: string) => void;
}

/**
 * An editable vernacular field for new words that indicates whether the
 * vernacular already exists in a collection
 */
export class NewVernEntry extends React.Component<
  LocalizeContextProps & NewVernEntryProps
> {
  render() {
    return (
      <div>
        <TextField
          autoFocus
          label={<Translate id="addWords.vernacular" />}
          fullWidth
          variant="outlined"
          value={this.props.vernacular}
          onChange={(e) => this.props.updateVernField(e.target.value)}
          inputRef={this.props.vernInput}
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
