import React from "react";
import { TextField } from "@material-ui/core";

import {
  Translate,
  LocalizeContextProps,
  withLocalize,
} from "react-localize-redux";

interface NewVernEntryProps {
  vernacular: string;
  vernInput: React.RefObject<HTMLDivElement>;
  updateVernField: (newValue: string) => void;
}

/**
 * An editable vernacular field for new words
 */
export class NewVernEntry extends React.Component<
  LocalizeContextProps & NewVernEntryProps
> {
  render() {
    return (
      <div>
        <TextField
          autoFocus
          id="newvernentry"
          label={<Translate id="addWords.vernacular" />}
          fullWidth
          variant="outlined"
          value={this.props.vernacular}
          onChange={(e) => this.props.updateVernField(e.target.value)}
          inputRef={this.props.vernInput}
        />
      </div>
    );
  }
}

export default withLocalize(NewVernEntry);
