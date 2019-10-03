import React from "react";
import { TextField, Tooltip } from "@material-ui/core";
import {
  Translate,
  LocalizeContextProps,
  withLocalize
} from "react-localize-redux";

interface ExistingGlossEntryProps {
  glosses: string;
  isSpelledCorrectly: boolean;
  toggleSpellingSuggestionsView: () => void;
  updateGlossField: (newValue: string) => void;
}

/**
 * An editable gloss field for existing words that indicates whether the
 * gloss is mispelled
 */
export class ExistingGloss extends React.Component<
  ExistingGlossEntryProps & LocalizeContextProps
> {
  render() {
    return (
      <div>
        <TextField
          fullWidth
          value={this.props.glosses}
          onChange={e => this.props.updateGlossField(e.target.value)}
          InputProps={
            this.props.isSpelledCorrectly
              ? {
                  style: {
                    color: "black"
                  }
                }
              : {
                  style: {
                    color: "red"
                  }
                }
          }
        />
        {!this.props.isSpelledCorrectly && (
          <Tooltip
            title={<Translate id="addWords.mispelledWord" />}
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
              onClick={() => this.props.toggleSpellingSuggestionsView()}
            />
          </Tooltip>
        )}
      </div>
    );
  }
}

export default withLocalize(ExistingGloss);
