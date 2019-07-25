import * as React from "react";
import {
  LocalizeContextProps,
  withLocalize,
  Translate
} from "react-localize-redux";
import { Typography } from "@material-ui/core";

export interface CharacterInfoProps {
  character: string;
  allWords: string[];
}

interface CharacterInfoState {}

export class CharacterInfo extends React.Component<
  CharacterInfoProps & LocalizeContextProps,
  CharacterInfoState
> {
  constructor(props: CharacterInfoProps & LocalizeContextProps) {
    super(props);
    this.state = {};
  }

  render() {
    return (
      <React.Fragment>
        <Typography variant="body1">
          {charToHexValue(this.props.character)}
        </Typography>
        <Typography variant="body1">Details</Typography>
        <Typography variant="body1">
          {countCharacterOccurences(this.props.character, this.props.allWords)}{" "}
          <Translate id="charInventory.characterSet.occurrences" />
        </Typography>
      </React.Fragment>
    );
  }
}

function charToHexValue(char: string) {
  let hex: string = char
    .charCodeAt(0)
    .toString(16)
    .toUpperCase();
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

export default withLocalize(CharacterInfo);
