import React from "react";
import { Typography, Grid, Chip } from "@material-ui/core";
import theme from "../../../../types/theme";
import { Word, Sense } from "../../../../types/word";

interface DuplicateResolutionViewProps {
  existingEntry: Word;
  newSense: string;
  addSense: (existingWord: Word, newSense: string) => void;
  addSemanticDomain: (existingWord: Word, sense: Sense, index: number) => void;
}

/**
 * Displays a duplicate word, and allows adding a semantic domain or a new sense
 * to the word
 */
export class DuplicateResolutionView extends React.Component<
  DuplicateResolutionViewProps
> {
  render() {
    return (
      <Grid container>
        <Grid
          item
          xs={5}
          style={{
            paddingLeft: theme.spacing(2),
            paddingRight: theme.spacing(2)
          }}
        >
          <Typography variant="body1">
            {"Similar word: " + this.props.existingEntry.vernacular}
          </Typography>
        </Grid>
        <Grid
          item
          xs={5}
          style={{
            paddingLeft: theme.spacing(2),
            paddingRight: theme.spacing(2)
          }}
        >
          <Typography variant="body1">{"Glosses: "}</Typography>
          {this.props.existingEntry.senses.map((sense: Sense, index) =>
            sense.glosses
              .filter(gloss => gloss.language === "en")
              .map(gloss => (
                <Chip
                  key={gloss.def + "_" + index}
                  label={gloss.def}
                  style={{ margin: 4 }}
                  onClick={() => {
                    this.props.addSemanticDomain(
                      this.props.existingEntry,
                      sense,
                      index
                    );
                  }}
                />
              ))
          )}
          <Chip
            variant="outlined"
            label={"Add New Sense +"}
            style={{ margin: 4 }}
            onClick={() => {
              this.props.addSense(
                this.props.existingEntry,
                this.props.newSense
              );
            }}
          />
        </Grid>
      </Grid>
    );
  }
}
