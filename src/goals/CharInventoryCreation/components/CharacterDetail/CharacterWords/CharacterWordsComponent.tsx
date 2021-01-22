import { Typography } from "@material-ui/core";
import * as React from "react";
import { Translate } from "react-localize-redux";

import { highlight } from "types/theme";

export interface CharacterWordsProps {
  character: string;
  allWords: string[];
}

/** Displays words that contain a character */
export default function CharacterWords(props: CharacterWordsProps) {
  return (
    <React.Fragment>
      <Typography variant="overline">
        <Translate id="charInventory.examples" />
      </Typography>
      {getWordsContainingChar(props.character, props.allWords, 5).map(
        (word) => (
          <Typography variant="body1">
            {highlightCharacterInWord(props.character, word)}
          </Typography>
        )
      )}
    </React.Fragment>
  );
}

function getWordsContainingChar(
  character: string,
  words: string[],
  maxCount: number
) {
  let wordsContainingChar = [];
  for (let word of words) {
    if (word.indexOf(character) !== -1) wordsContainingChar.push(word);
    if (wordsContainingChar.length >= maxCount) break;
  }
  return wordsContainingChar;
}

function highlightCharacterInWord(character: string, word: string) {
  let newWord: (JSX.Element | string)[] = [];
  for (const letter of word) {
    if (letter === character)
      newWord.push(
        <span
          style={{
            background: highlight,
            padding: "3px 0",
            //borderBottom: "2px solid red"
          }}
        >
          {letter}
        </span>
      );
    else newWord.push(letter);
  }
  return newWord;
}
