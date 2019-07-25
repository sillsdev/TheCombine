import * as React from "react";
import { LocalizeContextProps, withLocalize } from "react-localize-redux";
import { Grid, Typography } from "@material-ui/core";
import theme from "../../../../types/theme";
import CharacterInfo from "./CharacterInfo";
import CharacterStatusControl from "./CharacterStatusControl";

export interface CharacterDetailProps {
  character: string;
}

interface CharacterDetailState {}

export class CharacterDetail extends React.Component<
  CharacterDetailProps & LocalizeContextProps,
  CharacterDetailState
> {
  constructor(props: CharacterDetailProps & LocalizeContextProps) {
    super(props);
    this.state = {};
  }

  render() {
    return (
      <Grid
        container
        spacing={2}
        direction="row"
        justify="flex-start"
        alignItems="center"
        style={{ padding: theme.spacing(1) }}
      >
        <Grid item xs={3}>
          <Typography variant="h1">{this.props.character}</Typography>
        </Grid>
        <Grid item xs={9}>
          <CharacterStatusControl character={this.props.character} />
        </Grid>
        <Grid item xs={12}>
          <CharacterInfo character={this.props.character} />
        </Grid>
        <Grid item xs={12}>
          Examples ->
        </Grid>
        <Grid item xs={12}>
          Rules ->
        </Grid>
        <Grid item xs={12} />
      </Grid>
    );
  }
}

export default withLocalize(CharacterDetail);
