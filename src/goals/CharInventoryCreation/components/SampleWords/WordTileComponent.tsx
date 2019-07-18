import * as React from "react";
import { LocalizeContextProps, withLocalize } from "react-localize-redux";
import { Grid, IconButton, Tooltip, Typography, Chip } from "@material-ui/core";
import BlockIcon from "@material-ui/icons/Block";
import { Add } from "@material-ui/icons";
import { greenHighlight } from "../../../../types/theme";

const TRANSITION = "all 0.25s";

export interface WordTileProps {
  word: string;
  allCharacters: string[]; // valid and rejected
  addToCharSet: (chars: string) => void;
  addWordToIgnoreList: (word: string) => void;
  hover: boolean;
  setHover: () => void;
  unsetHover: () => void;
}

export interface WordTileState {}

export class WordTile extends React.Component<
  WordTileProps & LocalizeContextProps,
  WordTileState
> {
  constructor(props: WordTileProps & LocalizeContextProps) {
    super(props);
    this.newCharacters = "";
  }

  newCharacters: string;

  render() {
    let word = this.props.word;
    this.newCharacters = "";
    return (
      <Grid item key={word}>
        <Chip
          style={
            this.props.hover
              ? {
                  transition: TRANSITION,
                  borderColor: "#ccc"
                }
              : {
                  transition: TRANSITION,
                  borderColor: "white"
                }
          }
          // 'add to inventory' button
          avatar={
            <Tooltip
              title={
                this.props.translate("charInventory.sampleWords.add") as string
              }
              placement="top"
            >
              <IconButton
                style={
                  this.props.hover
                    ? {
                        transition: TRANSITION,
                        opacity: 1
                      }
                    : {
                        transition: TRANSITION,
                        opacity: 0.01
                      }
                }
                size="small"
                onClick={() => {
                  this.props.addToCharSet(this.newCharacters);
                }}
              >
                <Add />
              </IconButton>
            </Tooltip>
          }
          onMouseEnter={() => this.props.setHover()}
          onMouseLeave={() => this.props.unsetHover()}
          variant="outlined"
          deleteIcon={
            <Tooltip
              title={
                this.props.translate(
                  "charInventory.sampleWords.ignore"
                ) as string
              }
              placement="top"
              style={
                this.props.hover
                  ? {
                      transition: TRANSITION,
                      opacity: 1
                    }
                  : {
                      transition: TRANSITION,
                      opacity: 0.01
                    }
              }
            >
              <BlockIcon />
            </Tooltip>
          }
          onDelete={() => {
            this.props.addWordToIgnoreList(word);
          }}
          label={
            <Typography variant="body1">
              {word.split("").map((letter: string, index: number) => {
                // Highlight character if not in the inventory (don't highlight " ")
                if ([...this.props.allCharacters, " "].includes(letter)) {
                  return letter;
                } else {
                  this.newCharacters += letter;
                  return (
                    <span
                      key={index}
                      style={{
                        background: greenHighlight,
                        padding: "3px 0"
                        //borderBottom: "2px solid red"
                      }}
                    >
                      {letter}
                    </span>
                  );
                }
              })}
            </Typography>
          }
        />
      </Grid>
    );
  }
}

export default withLocalize(WordTile);
