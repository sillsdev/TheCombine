import * as React from "react";
import {
  LocalizeContextProps,
  withLocalize,
  Translate
} from "react-localize-redux";
import { Grid, Typography } from "@material-ui/core";
import CharacterCard from "./CharacterCard";

export interface CharacterListProps {
  setValidCharacters: (inventory: string[]) => void;
  validCharacters: string[];
  setRejectedCharacters: (inventory: string[]) => void;
  rejectedCharacters: string[];
  setSelectedCharacter: (character: string) => void;
  allWords: string[];
}

interface CharacterListState {
  hoverChar: string;
}

export class CharacterList extends React.Component<
  CharacterListProps & LocalizeContextProps,
  CharacterListState
> {
  constructor(props: CharacterListProps & LocalizeContextProps) {
    super(props);
    this.state = {
      hoverChar: ""
    };
  }

  render() {
    return (
      <React.Fragment>
        {this.props.validCharacters.length <= 0 &&
        this.props.rejectedCharacters.length <= 0 ? (
          <Grid item xs={12}>
            <Typography variant="subtitle1" style={{ color: "#999" }}>
              <Translate id="charInventory.characterSet.noCharacters" />
            </Typography>
          </Grid>
        ) : (
          <React.Fragment>
            {/* The grid of character tiles */
            this.props.validCharacters.map((char, index) => (
              <CharacterCard
                char={char}
                key={char}
                count={countCharacterOccurences(char, this.props.allWords)}
                status={"accepted"}
                onClick={() => this.props.setSelectedCharacter(char)}
              />
            ))}
            {this.props.rejectedCharacters.map(char => (
              <CharacterCard
                char={char}
                key={char}
                count={countCharacterOccurences(char, this.props.allWords)}
                status={"rejected"}
                onClick={() => this.props.setSelectedCharacter(char)}
              />
            ))}
          </React.Fragment>
        )}
      </React.Fragment>
    );
  }
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

export default withLocalize(CharacterList);
