import * as React from "react";
import { Grid, Typography } from "@material-ui/core";
import theme from "../../../../types/theme";
import CharacterInfo from "./CharacterInfo";
import CharacterStatusControl from "./CharacterStatusControl";
import CharacterWords from "./CharacterWords";

export interface CharacterDetailProps {
  character: string;
}

export default function CharacterDetail(props: CharacterDetailProps) {
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
        <Typography variant="h1">{props.character}</Typography>
      </Grid>
      <Grid item xs={9}>
        <CharacterStatusControl character={props.character} />
      </Grid>
      <Grid item xs={12}>
        <CharacterInfo character={props.character} />
      </Grid>
      <Grid item xs={12}>
        <CharacterWords character={props.character} />
      </Grid>
      <Grid item xs={12}>
        Rules ->
      </Grid>
      <Grid item xs={12} />
    </Grid>
  );
}
