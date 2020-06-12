import { Grid, TextField } from "@material-ui/core";
import React from "react";
import theme from "../../../../types/theme";
import { Word } from "../../../../types/word";
import DeleteEntry from "./DeleteEntry/DeleteEntry";

interface ImmutableExistingEntryProps {
  removeWord: (word: Word) => void;
  word: Word;
  vernacular: string;
  gloss: string;
}

interface ImmutableExistingEntryState {
  hovering: boolean;
}

/**
 * Displays a word users cannot edit any more
 */
export class ImmutableExistingEntry extends React.Component<
  ImmutableExistingEntryProps,
  ImmutableExistingEntryState
> {
  constructor(props: ImmutableExistingEntryProps) {
    super(props);
    this.state = {
      hovering: false,
    };
  }

  removeEntry() {
    this.props.removeWord(this.props.word);
  }

  render() {
    return (
      <Grid item xs={12}>
        <Grid
          container
          onMouseEnter={() => this.setState({ hovering: true })}
          onMouseLeave={() => this.setState({ hovering: false })}
        >
          <Grid
            item
            xs={4}
            key={"vernacular_" + this.props.vernacular}
            style={{
              paddingLeft: theme.spacing(2),
              paddingRight: theme.spacing(2),
              position: "relative",
            }}
          >
            <TextField disabled fullWidth value={this.props.vernacular} />
          </Grid>
          <Grid
            item
            xs={4}
            key={"gloss_" + this.props.gloss}
            style={{
              paddingLeft: theme.spacing(2),
              paddingRight: theme.spacing(2),
              position: "relative",
            }}
          >
            <TextField disabled fullWidth value={this.props.gloss} />
          </Grid>

          <Grid
            item
            xs={1}
            style={{
              paddingLeft: theme.spacing(1),
              paddingRight: theme.spacing(1),
              position: "relative",
            }}
          >
            {this.state.hovering && (
              <DeleteEntry removeEntry={() => this.removeEntry()} />
            )}
          </Grid>
        </Grid>
      </Grid>
    );
  }
}
