import { Grid2, Stack } from "@mui/material";
import { ReactElement, useEffect } from "react";

import CharacterDetail from "goals/CharacterInventory/CharInv/CharacterDetail";
import CharacterEntry from "goals/CharacterInventory/CharInv/CharacterEntry";
import CharacterList from "goals/CharacterInventory/CharInv/CharacterList";
import CharacterSetHeader from "goals/CharacterInventory/CharInv/CharacterSetHeader";
import {
  loadCharInvData,
  resetCharInv,
  setSelectedCharacter,
} from "goals/CharacterInventory/Redux/CharacterInventoryActions";
import { useAppDispatch, useAppSelector } from "rootRedux/hooks";
import { type StoreState } from "rootRedux/types";

/**
 * Allows users to define a character inventory for a project
 */
export default function CharacterInventory(): ReactElement {
  const dispatch = useAppDispatch();

  const selectedCharacter = useAppSelector(
    (state: StoreState) => state.characterInventoryState.selectedCharacter
  );

  useEffect(() => {
    dispatch(loadCharInvData());

    // Call when component unmounts.
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    () => dispatch(resetCharInv());
  }, [dispatch]);

  return (
    <Grid2 container spacing={2} sx={{ margin: 2 }}>
      <Grid2 size={selectedCharacter ? { xl: 9, lg: 8, md: 7, xs: 12 } : 12}>
        <Stack alignItems="flex-start" spacing={2}>
          <CharacterSetHeader />
          <CharacterEntry />
          <CharacterList />
        </Stack>
      </Grid2>

      {!!selectedCharacter && (
        <Grid2 size="grow">
          <CharacterDetail
            character={selectedCharacter}
            close={() => dispatch(setSelectedCharacter(""))}
          />
        </Grid2>
      )}
    </Grid2>
  );
}
