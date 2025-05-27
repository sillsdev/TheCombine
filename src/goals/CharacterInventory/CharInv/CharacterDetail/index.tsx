import { Close } from "@mui/icons-material";
import { Grid2, IconButton, Typography } from "@mui/material";
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
    <Grid2
      container
      spacing={2}
      direction="row"
      justifyContent="flex-start"
      alignItems="center"
      style={{ padding: theme.spacing(1) }}
    >
      <Grid2 size={3}>
        <Typography variant="h1" align="center">
          {props.character}
          {""}
          {/* There is a zero-width joiner here in case of non-printing characters. */}
        </Typography>
      </Grid2>
      <Grid2 size={8}>
        <CharacterStatusControl character={props.character} />
      </Grid2>
      <Grid2 size={1}>
        <IconButton onClick={() => props.close()} size="large">
          {" "}
          <Close />
        </IconButton>
      </Grid2>
      <Grid2 size={12}>
        <CharacterInfo character={props.character} />
      </Grid2>
      <Grid2 size={12}>
        <CharacterWords character={props.character} />
      </Grid2>
      <Grid2 size={12}>
        <FindAndReplace initialFindValue={props.character} />
      </Grid2>
    </Grid2>
  );
}
