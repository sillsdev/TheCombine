import { ArrowDownward, ArrowUpward } from "@mui/icons-material";
import {
  FormControl,
  Grid2,
  InputLabel,
  MenuItem,
  Select,
} from "@mui/material";
import { ReactElement, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import CharacterCard from "goals/CharacterInventory/CharInv/CharacterList/CharacterCard";
import { setSelectedCharacter } from "goals/CharacterInventory/Redux/CharacterInventoryActions";
import { CharacterSetEntry } from "goals/CharacterInventory/Redux/CharacterInventoryReduxTypes";
import { useAppDispatch, useAppSelector } from "rootRedux/hooks";
import { type StoreState } from "rootRedux/types";

enum SortOrder {
  CharacterAscending,
  CharacterDescending,
  OccurrencesAscending,
  OccurrencesDescending,
  Status,
}

export default function CharacterList(): ReactElement {
  const cardWidth = 150;
  const fontHeight = 65;

  const allChars = useAppSelector(
    (state: StoreState) => state.characterInventoryState.characterSet
  );

  const [orderedChars, setOrderedChars] = useState<CharacterSetEntry[]>([]);
  const [sortOrder, setSortOrder] = useState(SortOrder.CharacterAscending);

  const dispatch = useAppDispatch();
  const { t } = useTranslation();

  const selectCharacter = (character: string): void => {
    dispatch(setSelectedCharacter(character));
  };

  useEffect(() => {
    // Spread allChars to not mutate the Redux state.
    setOrderedChars(sortBy([...allChars], sortOrder));
  }, [allChars, sortOrder]);

  return (
    <>
      <FormControl variant="standard">
        <InputLabel htmlFor="sort-order">
          {t("charInventory.sortBy")}
        </InputLabel>
        <Select
          variant="standard"
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value as SortOrder)}
          inputProps={{ id: "sort-order" }}
        >
          <MenuItem value={SortOrder.CharacterAscending}>
            {t("charInventory.characters")}
            <ArrowUpward fontSize="small" />
          </MenuItem>
          <MenuItem value={SortOrder.CharacterDescending}>
            {t("charInventory.characters")}
            <ArrowDownward fontSize="small" />
          </MenuItem>
          <MenuItem value={SortOrder.OccurrencesAscending}>
            {t("charInventory.occurrences")}
            <ArrowUpward fontSize="small" />
          </MenuItem>
          <MenuItem value={SortOrder.OccurrencesDescending}>
            {t("charInventory.occurrences")}
            <ArrowDownward fontSize="small" />
          </MenuItem>
          <MenuItem value={SortOrder.Status}>
            {t("charInventory.status")}
          </MenuItem>
        </Select>
      </FormControl>

      <Grid2 container>
        {
          /* The grid of character tiles */
          orderedChars.map((character) => (
            <CharacterCard
              key={character.character}
              char={character.character}
              count={character.occurrences}
              status={character.status}
              onClick={() => selectCharacter(character.character)}
              fontHeight={fontHeight}
              cardWidth={cardWidth}
            />
          ))
        }
      </Grid2>
    </>
  );
}

function sortBy(
  characterSet: CharacterSetEntry[],
  sort: SortOrder
): CharacterSetEntry[] {
  switch (sort) {
    case SortOrder.CharacterAscending:
      return characterSet.sort(sortFunction("character"));
    case SortOrder.CharacterDescending:
      return characterSet.sort(sortFunction("character")).reverse();
    case SortOrder.OccurrencesAscending:
      return characterSet.sort(sortFunction("occurrences"));
    case SortOrder.OccurrencesDescending:
      return characterSet.sort(sortFunction("occurrences")).reverse();
    case SortOrder.Status:
      return characterSet.sort(sortFunction("status"));
    default:
      return characterSet;
  }
}

function sortFunction<K extends keyof CharacterSetEntry>(prop: K) {
  return (a: CharacterSetEntry, b: CharacterSetEntry): number =>
    a[prop] < b[prop] ? -1 : a[prop] > b[prop] ? 1 : 0;
}
