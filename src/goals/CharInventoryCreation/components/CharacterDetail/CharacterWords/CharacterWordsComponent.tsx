import * as React from "react";
import { Typography, Link } from "@material-ui/core";
import { highlight } from "../../../../../types/theme";

export interface CharacterWordsProps {
  character: string;
  allWords: string[];
}

export default function CharacterWords(props: CharacterWordsProps) {
  return (
    <React.Fragment>
      <Typography>
        <Link href={"#"} variant="overline">
          Examples ⟶
        </Link>
      </Typography>
      {getWordsContainingChar(props.character, props.allWords, 5).map(word => (
        <Typography variant="body1">
          {highlightCharacterInWord(props.character, word)}
        </Typography>
      ))}
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
  return word.split("").map((letter: string, index: number) => {
    if (letter === character) {
      return (
        <span
          key={index}
          style={{
            background: highlight,
            padding: "3px 0"
            //borderBottom: "2px solid red"
          }}
        >
          {letter}
        </span>
      );
    } else {
      return letter;
    }
  });
}
