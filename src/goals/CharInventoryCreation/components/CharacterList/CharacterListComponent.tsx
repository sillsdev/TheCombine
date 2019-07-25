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
  dragChar: string;
  dropChar: string;
}

export class CharacterList extends React.Component<
  CharacterListProps & LocalizeContextProps,
  CharacterListState
> {
  constructor(props: CharacterListProps & LocalizeContextProps) {
    super(props);
    this.state = {
      hoverChar: "",
      dragChar: "",
      dropChar: ""
    };
  }

  // reorders the character inventory by moving one char
  moveChar() {
    if (this.state.dragChar === this.state.dropChar) {
      this.setState({
        dragChar: "",
        dropChar: ""
      });
      return;
    }

    let inv = [...this.props.validCharacters];
    let dragIndex = inv.indexOf(this.state.dragChar);
    let dropIndex = inv.indexOf(this.state.dropChar);

    inv.splice(dragIndex, 1);

    if (dragIndex >= dropIndex) {
      inv.splice(dropIndex, 0, this.state.dragChar);
    } else {
      inv.splice(dropIndex - 1, 0, this.state.dragChar);
    }

    this.setState({
      dragChar: "",
      dropChar: ""
    });
    this.props.setValidCharacters(inv);
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
              // <Grid
              //   item
              //   sm={1}
              //   xs={2}
              //   key={"char_" + char}
              //   style={{ paddingBottom: 0 }}
              //   onDragOver={e => {
              //     e.preventDefault();
              //     e.dataTransfer.dropEffect = "move";
              //     if (this.state.dropChar !== char)
              //       this.setState({ dropChar: char });
              //   }}
              // >
              //   <Grid container justify="center">
              //     <div
              //       id={"charTile_" + char}
              //       style={{
              //         position: "relative",
              //         border: "4px solid " + green[100],
              //         borderRadius: "50%",
              //         width: 40,
              //         height: 40,
              //         display: "flex",
              //         justifyContent: "center",
              //         alignItems: "center",
              //         cursor: "pointer"
              //       }}
              //       onMouseEnter={() => this.setState({ hoverChar: char })}
              //       onMouseLeave={() => this.setState({ hoverChar: "" })}
              //       onClick={() => {
              //         this.props.setRejectedCharacters(
              //           this.props.rejectedCharacters.concat(char)
              //         );
              //         this.setState({
              //           hoverChar: this.props.validCharacters[index + 1]
              //             ? this.props.validCharacters[index + 1]
              //             : ""
              //         });
              //       }}
              //       draggable={true}
              //       onDragStart={e => {
              //         this.setState({ dragChar: char });
              //         e.dataTransfer.effectAllowed = "move";
              //       }}
              //       onDragEnd={e => {
              //         e.preventDefault();
              //         this.moveChar();
              //       }}
              //     >
              //       <Typography variant="h6">{char}</Typography>
              //     </div>
              //     <Typography
              //       variant="subtitle2"
              //       style={{ opacity: this.state.hoverChar === char ? 1 : 0 }}
              //     >
              //       <Translate id="charInventory.characterSet.accepted" />
              //     </Typography>
              //   </Grid>
              // </Grid>
            ))}
            {this.props.rejectedCharacters.map(char => (
              <CharacterCard
                char={char}
                key={char}
                count={countCharacterOccurences(char, this.props.allWords)}
                status={"rejected"}
                onClick={() => this.props.setSelectedCharacter(char)}
              />
              // <Grid
              //   item
              //   sm={1}
              //   xs={2}
              //   key={"char_" + char}
              //   style={{ paddingBottom: 0 }}
              // >
              //   <Grid container justify="center">
              //     <div
              //       id={"charTile_" + char}
              //       style={{
              //         position: "relative",
              //         border: "4px solid " + red[100],
              //         borderRadius: "50%",
              //         width: 40,
              //         height: 40,
              //         display: "flex",
              //         justifyContent: "center",
              //         alignItems: "center",
              //         cursor: "pointer"
              //       }}
              //       onMouseEnter={() => this.setState({ hoverChar: char })}
              //       onMouseLeave={() => this.setState({ hoverChar: "" })}
              //       onClick={() =>
              //         this.props.setValidCharacters(
              //           this.props.validCharacters.concat(char)
              //         )
              //       }
              //     >
              //       <Typography variant="h6">{char}</Typography>
              //     </div>
              //     <Typography
              //       variant="subtitle2"
              //       style={{ opacity: this.state.hoverChar === char ? 1 : 0 }}
              //     >
              //       <Translate id="charInventory.characterSet.rejected" />
              //     </Typography>
              //   </Grid>
              // </Grid>
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
