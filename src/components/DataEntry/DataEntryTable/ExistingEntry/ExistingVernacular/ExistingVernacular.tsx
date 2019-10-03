import React from "react";
import { TextField, Tooltip } from "@material-ui/core";
import {
  Translate,
  LocalizeContextProps,
  withLocalize
} from "react-localize-redux";

interface ExistingVernEntryProps {
  vernacular: string;
  isDuplicate: boolean;
  toggleDuplicateResolutionView: () => void;
  updateField: (newValue: string) => void;
  updateWord: () => void;
}

/**
 * An editable vernacular field for existing words that indicates whether the
 * vernacular already exists in a collection
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
          onChange={e => this.props.updateField(e.target.value)}
          onBlur={() => this.props.updateWord()}
        />
        {this.props.isDuplicate && (
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
                top: 8,
                right: 48,
                cursor: "pointer"
              }}
              onClick={() => this.props.toggleDuplicateResolutionView()}
            />
          </Tooltip>
        )}
      </div>
    );
  }
}

export default withLocalize(ExistingVernacular);
