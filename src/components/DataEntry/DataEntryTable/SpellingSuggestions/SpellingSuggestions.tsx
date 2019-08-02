import React from "react";
import { Typography, Grid, Chip } from "@material-ui/core";
import theme from "../../../../types/theme";

interface SpellingSuggestionsProps {
  mispelledWord: string;
  spellingSuggestions: string[];
  chooseSpellingSuggestion: (suggestion: string) => void;
}

/**
 * Displays spelling suggestions for a word, and allows choosing one of the
 * suggestions
 */
export class SpellingSuggestionsView extends React.Component<
  SpellingSuggestionsProps
> {
  render() {
    return (
      <Grid
        item
        xs={12}
        key={"mispelledNewEntry"}
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
              {"Mispelled gloss: " + this.props.mispelledWord}
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
            <Typography variant="body1">{"Suggestions: "}</Typography>
            {this.props.spellingSuggestions.length > 0 ? (
              this.props.spellingSuggestions.map(suggestion => (
                <Chip
                  label={suggestion}
                  style={{ margin: 4 }}
                  onClick={() =>
                    this.props.chooseSpellingSuggestion(suggestion)
                  }
                />
              ))
            ) : (
              <Typography variant="body1">
                {"No suggestions available"}
              </Typography>
            )}
          </Grid>
        </Grid>
      </Grid>
    );
  }
}
