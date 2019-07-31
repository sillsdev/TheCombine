import React from "react";
import { Grid, TextField, Tooltip } from "@material-ui/core";
import theme from "../../../../../types/theme";
import {
  Translate,
  LocalizeContextProps,
  withLocalize
} from "react-localize-redux";

interface NewGlossEntryProps {
  glosses: string;
  glossInput: React.RefObject<HTMLDivElement>;
  isSpelledCorrectly: boolean;
  toggleSpellingSuggestionsView: () => void;
  updateGlossField: (newValue: string) => void;
}

export class NewGlossEntry extends React.Component<
  NewGlossEntryProps & LocalizeContextProps
> {
  render() {
    return (
      <Grid
        item
        xs={5}
        style={{
          paddingLeft: theme.spacing(2),
          paddingRight: theme.spacing(2),
          position: "relative"
        }}
      >
        <TextField
          label={<Translate id="addWords.glosses" />}
          fullWidth
          variant="outlined"
          value={this.props.glosses}
          onChange={e => {
            this.props.updateGlossField(e.target.value);
          }}
          inputRef={this.props.glossInput}
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
                top: 24,
                right: 48,
                cursor: "pointer"
              }}
              onClick={() => this.props.toggleSpellingSuggestionsView()}
            />
          </Tooltip>
        )}
      </Grid>
    );
  }
}

export default withLocalize(NewGlossEntry);
