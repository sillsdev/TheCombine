import React from "react";
import { Grid, TextField, Tooltip } from "@material-ui/core";
import theme from "../../../../types/theme";
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

export class ExistingVernEntry extends React.Component<
  ExistingVernEntryProps & LocalizeContextProps
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
      </Grid>
    );
  }
}

export default withLocalize(ExistingVernEntry);
