import { Typography } from "@material-ui/core";
import * as React from "react";
import { Translate } from "react-localize-redux";
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
  return (
    <React.Fragment>
      <Typography variant="body1">{charToHexValue(props.character)}</Typography>
      <Typography variant="body1">
        <Translate id="charInventory.characterSet.charDetails" />
      </Typography>
      <Typography variant="body1">
        {countCharacterOccurences(props.character, allWords)}{" "}
        <Translate id="charInventory.characterSet.occurrences" />
      </Typography>
    </React.Fragment>
  );
}

function charToHexValue(char: string) {
  let hex: string = char.charCodeAt(0).toString(16).toUpperCase();
  while (hex.length < 4) {
    hex = "0" + hex;
  }
  return "U+" + hex;
}

function countCharacterOccurences(char: string, words: string[]) {
  let count = 0;
  for (let word of words) {
    for (let letter of word) {
      if (letter === char) {
        count++;
      }
    }
  }
  return count;
}
