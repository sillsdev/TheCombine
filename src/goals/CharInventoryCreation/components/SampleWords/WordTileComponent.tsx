import * as React from "react";
import { LocalizeContextProps, withLocalize } from "react-localize-redux";
import {
  Grid,
  Paper,
  IconButton,
  Tooltip,
  Typography
} from "@material-ui/core";
import { Add, Block } from "@material-ui/icons";
import { greenHighlight } from "../../../../types/theme";

const TRANSITION =
  "width 0.25s, opacity 0.25s, background-color 150ms cubic-bezier(0.4, 0, 0.2, 1) 0ms";

export interface WordTileProps {
  word: string;
  allCharacters: string[]; // valid and rejected
  addToCharSet: (chars: string) => void;
  addWordToIgnoreList: (word: string) => void;
}

export interface WordTileState {
  hover: Boolean;
}

export class WordTile extends React.Component<
  WordTileProps & LocalizeContextProps,
  WordTileState
> {
  constructor(props: WordTileProps & LocalizeContextProps) {
    super(props);
    this.state = { hover: false };
    this.newCharacters = "";
  }

  newCharacters: string;

  render() {
    let word = this.props.word;
    this.newCharacters = "";
    return (
      <Grid item xs={12} key={word}>
        <Grid container justify="flex-start">
          <Paper
            className="classes.paper"
            style={{
              textAlign: "center",
              padding: "5px 10px",
              cursor: "pointer"
            }}
            onMouseEnter={() => this.setState({ hover: true })}
            onMouseLeave={() => this.setState({ hover: false })}
          >
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
                        padding: "3px 0",
                        borderBottom: "2px solid red"
                      }}
                    >
                      {letter}
                    </span>
                  );
                }
              })}{" "}
              {/* 'add to inventory' button */}
              <Tooltip
                title={
                  this.props.translate(
                    "charInventory.sampleWords.add"
                  ) as string
                }
                placement="top"
              >
                <IconButton
                  style={
                    this.state.hover
                      ? {
                          transition: TRANSITION,
                          width: "1.7em",
                          opacity: 1,
                          padding: "3px"
                        }
                      : {
                          transition: TRANSITION,
                          width: "0",
                          opacity: 0.01,
                          padding: "auto 0"
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
              {/* 'ignore for now' button */}
              <Tooltip
                title={
                  this.props.translate(
                    "charInventory.sampleWords.ignore"
                  ) as string
                }
                placement="top"
              >
                <IconButton
                  style={
                    this.state.hover
                      ? {
                          transition: TRANSITION,
                          width: "1.7em",
                          opacity: 1,
                          padding: "3px"
                        }
                      : {
                          transition: TRANSITION,
                          width: "0em",
                          opacity: 0,
                          padding: 0
                        }
                  }
                  size="small"
                  onClick={() => {
                    this.props.addWordToIgnoreList(word);
                  }}
                >
                  <Block />
                </IconButton>
              </Tooltip>
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    );
  }
}

export default withLocalize(WordTile);
