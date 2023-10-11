import { Close } from "@mui/icons-material";
import { Grid, IconButton, Typography } from "@mui/material";
import { ReactElement } from "react";

import CharacterInfo from "goals/CharacterInventory/CharInv/CharacterDetail/CharacterInfo";
import CharacterStatusControl from "goals/CharacterInventory/CharInv/CharacterDetail/CharacterStatusControl";
import CharacterWords from "goals/CharacterInventory/CharInv/CharacterDetail/CharacterWords";
import FindAndReplace from "goals/CharacterInventory/CharInv/CharacterDetail/FindAndReplace";
import theme from "types/theme";

interface CharacterDetailProps {
  character: string;
  close: () => void;
}

/** A view displaying detailed information about a character */
export default function CharacterDetail(
  props: CharacterDetailProps
): ReactElement {
  return (
    <Grid
      container
      spacing={2}
      direction="row"
      justifyContent="flex-start"
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
        <IconButton onClick={() => props.close()} size="large">
          {" "}
          <Close />
        </IconButton>
      </Grid>
      <Grid item xs={12}>
        <CharacterInfo character={props.character} />
      </Grid>
      <Grid item xs={12}>
        <CharacterWords character={props.character} />
      </Grid>
      <Grid item xs={12}>
        <FindAndReplace initialFindValue={props.character} />
      </Grid>
    </Grid>
  );
}
