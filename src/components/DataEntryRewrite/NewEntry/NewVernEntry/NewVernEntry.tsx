import React from "react";
import { Grid, TextField, Tooltip } from "@material-ui/core";
import theme from "../../../../types/theme";

import {
  Translate,
  LocalizeContextProps,
  withLocalize
} from "react-localize-redux";

interface NewVernEntryProps {
  vernacular: string;
  isDuplicate: boolean;
  toggleDuplicateResolutionView: () => void;
  updateVernField: (newValue: string) => void;
}

export class NewVernEntry extends React.Component<
  LocalizeContextProps & NewVernEntryProps
> {
  constructor(props: LocalizeContextProps & NewVernEntryProps) {
    super(props);
    this.vernInput = React.createRef<HTMLDivElement>();
  }

  vernInput: React.RefObject<HTMLDivElement>;

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
          autoFocus
          label={<Translate id="addWords.vernacular" />}
          fullWidth
          variant="outlined"
          value={this.props.vernacular}
          onChange={e => this.props.updateVernField(e.target.value)}
          inputRef={this.vernInput}
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
                top: 24,
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

export default withLocalize(NewVernEntry);
