import { Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";

import { StoreState } from "types";

interface CharacterInfoProps {
  character: string;
}

/** Displays basic information about a character */
export default function CharacterInfo(props: CharacterInfoProps) {
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

function charToHexValue(char: string) {
  let hex = char.charCodeAt(0).toString(16).toUpperCase();
  return `U+${"0".repeat(4 - hex.length)}${hex}`;
}

function countCharacterOccurrences(char: string, words: string[]) {
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
