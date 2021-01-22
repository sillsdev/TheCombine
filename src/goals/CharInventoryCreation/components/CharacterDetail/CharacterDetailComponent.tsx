import { Grid, IconButton, Typography } from "@material-ui/core";
import { Close } from "@material-ui/icons";
import * as React from "react";

import theme from "types/theme";
import CharacterInfo from "goals/CharInventoryCreation/components/CharacterDetail/CharacterInfo";
import CharacterStatusControl from "goals/CharInventoryCreation/components/CharacterDetail/CharacterStatusControl";
import CharacterWords from "goals/CharInventoryCreation/components/CharacterDetail/CharacterWords";
import FindAndReplace from "goals/CharInventoryCreation/components/CharacterDetail/FindAndReplace";

export interface CharacterDetailProps {
  character: string;
  close: () => void;
}

/** A view displaying detailed information about a character */
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
        <Typography variant="h1" align="center">
          {props.character}
          {""}
          {/* There is a zero-width joiner here in case of non-printing characters. */}
        </Typography>
      </Grid>
      <Grid item xs={8}>
        <CharacterStatusControl character={props.character} />
      </Grid>
      <Grid item xs={1}>
        <IconButton onClick={() => props.close()}>
          {" "}
          <Close />
        </IconButton>
      </Grid>
      <Grid item xs={12}>
        <CharacterInfo character={props.character} allWords={[]} />
      </Grid>
      <Grid item xs={12}>
        <CharacterWords character={props.character} allWords={[]} />
      </Grid>
      <Grid item xs={12}>
        <FindAndReplace initialFindValue={props.character} />
      </Grid>
    </Grid>
  );
}
