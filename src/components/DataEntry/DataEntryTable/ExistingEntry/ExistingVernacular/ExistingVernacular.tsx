import React from "react";
import { TextField } from "@material-ui/core";
import { LocalizeContextProps, withLocalize } from "react-localize-redux";

interface ExistingVernEntryProps {
  vernacular: string;
  updateField: (newValue: string) => void;
  updateWord: () => void;
}

/**
 * An editable vernacular field for existing words
 */
export class ExistingVernacular extends React.Component<
  ExistingVernEntryProps & LocalizeContextProps
> {
  render() {
    return (
      <div>
        <TextField
          fullWidth
          value={this.props.vernacular}
          onChange={(e) => this.props.updateField(e.target.value)}
          onBlur={() => this.props.updateWord()}
        />
      </div>
    );
  }
}

export default withLocalize(ExistingVernacular);
