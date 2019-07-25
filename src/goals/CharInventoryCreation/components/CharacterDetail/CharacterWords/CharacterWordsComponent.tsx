import * as React from "react";
import { Typography } from "@material-ui/core";
import { ArrowRightAlt } from "@material-ui/icons";

export interface CharacterWordsProps {
  character: string;
  allWords: string[];
}

export default function CharacterWords(props: CharacterWordsProps) {
  return (
    <React.Fragment>
      <Typography
        variant="body1"
        style={{ display: "inline-flex", verticalAlign: "middle" }}
      >
        Example words with character
        <ArrowRightAlt />
      </Typography>
      {getWordsContainingChar(props.character, props.allWords, 5).map(word => (
        <Typography variant="body1">{word}</Typography>
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
