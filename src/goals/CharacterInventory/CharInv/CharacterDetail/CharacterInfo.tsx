import { Typography } from "@mui/material";
import { ReactElement } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";

import { type StoreState } from "rootRedux/rootReduxTypes";

interface CharacterInfoProps {
  character: string;
}

/** Displays basic information about a character */
export default function CharacterInfo(props: CharacterInfoProps): ReactElement {
  const allWords = useSelector(
    (state: StoreState) => state.characterInventoryState.allWords
  );
  const { t } = useTranslation();

  return (
    <>
      <Typography variant="body1">{charToHexValue(props.character)}</Typography>
      <br />
      <Typography variant="body1">
        {t("charInventory.characterSet.occurrences", {
          val: countCharacterOccurrences(props.character, allWords),
        })}
      </Typography>
    </>
  );
}

function charToHexValue(char: string): string {
  const hex = char.charCodeAt(0).toString(16).toUpperCase();
  return `U+${"0".repeat(4 - hex.length)}${hex}`;
}

function countCharacterOccurrences(char: string, words: string[]): number {
  let count = 0;
  for (const word of words) {
    for (const letter of word) {
      if (letter === char) {
        count++;
      }
    }
  }
  return count;
}
