import { Typography } from "@mui/material";
import { ReactElement, useContext } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";

import { StoreState } from "types";
import { themeColors } from "types/theme";
import FontContext from "utilities/fontContext";

interface CharacterWordsProps {
  character: string;
}

/** Displays words that contain a character */
export default function CharacterWords(
  props: CharacterWordsProps
): ReactElement {
  const fontMap = useContext(FontContext);
  const allWords = useSelector(
    (state: StoreState) => state.characterInventoryState.allWords
  );
  const { t } = useTranslation();
  const words = getWordsContainingChar(props.character, allWords, 5);

  return (
    <>
      <Typography variant="overline">{t("charInventory.examples")}</Typography>
      {words.map((word) => (
        <Typography
          key={`${props.character}_${word}`}
          style={{ fontFamily: fontMap[""] || "inherit" }}
          variant="body1"
        >
          {highlightCharacterInWord(props.character, word)}
        </Typography>
      ))}
    </>
  );
}

function getWordsContainingChar(
  character: string,
  words: string[],
  maxCount: number
): string[] {
  const wordsWithChar: string[] = [];
  for (const word of words) {
    if (word.indexOf(character) !== -1 && !wordsWithChar.includes(word)) {
      wordsWithChar.push(word);
      if (wordsWithChar.length === maxCount) {
        break;
      }
    }
  }
  return wordsWithChar;
}

function highlightCharacterInWord(
  character: string,
  word: string
): ReactElement[] {
  const highlightedWord: ReactElement[] = [];
  for (let i = 0; i < word.length; i++) {
    const letter = word[i];
    const key = `${character}_${word}_${i}`;
    highlightedWord.push(wordSpan(letter, key, letter === character));
  }
  return highlightedWord;
}

function wordSpan(word: string, key: string, highlight: boolean): ReactElement {
  return (
    <span
      key={key}
      style={{
        background: highlight ? themeColors.highlight : undefined,
        padding: "3px 0",
      }}
    >
      {word}
    </span>
  );
}
