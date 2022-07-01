import { Typography } from "@material-ui/core";
import React from "react";
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
    <React.Fragment>
      <Typography variant="body1">{charToHexValue(props.character)}</Typography>
      <Typography variant="body1">
        {t("charInventory.characterSet.charDetails")}
      </Typography>
      <Typography variant="body1">
        {countCharacterOccurrences(props.character, allWords)}{" "}
        {t("charInventory.characterSet.occurrences")}
      </Typography>
    </React.Fragment>
  );
}

function charToHexValue(char: string) {
  let hex = char.charCodeAt(0).toString(16).toUpperCase();
  while (hex.length < 4) {
    hex = "0" + hex;
  }
  return "U+" + hex;
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
