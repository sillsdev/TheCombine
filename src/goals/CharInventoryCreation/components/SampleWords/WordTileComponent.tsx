import * as React from "react";
import {
  LocalizeContextProps,
  withLocalize,
  Translate
} from "react-localize-redux";
import {
  Grid,
  Typography,
  Paper,
  Button,
  IconButton,
  Tooltip
} from "@material-ui/core";
import { Refresh as RefreshIcon } from "@material-ui/icons";
import { Word } from "../../../../types/word";
import * as backend from "../../../../backend";
import { Add, Block } from "@material-ui/icons";

const TRANSITION =
  "width 0.25s, opacity 0.25s, background-color 150ms cubic-bezier(0.4, 0, 0.2, 1) 0ms";

export interface WordTileProps {
  word: string;
  addWordToCharSet: (arg0: string) => void;
  addWordToIgnoreList: (arg0: string) => void;
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
  }

  render() {
    let word = this.props.word;
    return (
      <Grid
        item
        xs={12}
        key={word}
        onMouseEnter={() => this.setState({ hover: true })}
        onMouseLeave={() => this.setState({ hover: false })}
      >
        <Grid container justify="flex-start">
          <Paper
            className="classes.paper"
            style={{
              minWidth: 40,
              textAlign: "center",
              padding: "5px 10px",
              cursor: "pointer"
            }}
          >
            {word + " "}
            <Tooltip
              title={
                this.props.translate("charInventory.sampleWords.add") as string
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
                  this.props.addWordToCharSet(word);
                }}
              >
                <Add />
              </IconButton>
            </Tooltip>
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
          </Paper>
        </Grid>
      </Grid>
    );
  }
}

export default withLocalize(WordTile);
