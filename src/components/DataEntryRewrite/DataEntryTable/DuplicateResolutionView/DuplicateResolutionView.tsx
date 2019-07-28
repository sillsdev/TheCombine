import React from "react";
import { Typography, Grid, Chip } from "@material-ui/core";
import theme from "../../../../types/theme";
import { Word, Sense } from "../../../../types/word";

interface DuplicateResolutionViewProps {
  existingEntry: Word;
  newSense: string;
  addSense: (existingWord: Word, newSense: string) => void;
}

export class DuplicateResolutionView extends React.Component<
  DuplicateResolutionViewProps
> {
  render() {
    return (
      <Grid
        item
        xs={12}
        key={"duplicateNewVernEntry"}
        style={{ background: "whitesmoke" }}
      >
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
              {"Duplicate in database: " + this.props.existingEntry.vernacular}
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
            {this.props.existingEntry.senses.map((sense: Sense) =>
              sense.glosses.map(gloss => (
                <Chip label={gloss.def} style={{ margin: 4 }} />
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
      </Grid>
    );
  }
}
