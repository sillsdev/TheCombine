import React from "react";
import {
  Typography,
  TextField,
  Grid,
  IconButton,
  Tooltip,
  Chip,
  Button
} from "@material-ui/core";
import theme from "../../../types/theme";

import {
  Translate,
  TranslateFunction,
  LocalizeContextProps,
  withLocalize
} from "react-localize-redux";
import { Word, SemanticDomain, State, Gloss } from "../../../types/word";
import { Delete } from "@material-ui/icons";
import * as Backend from "../../../backend";
import DuplicateFinder from "../../../goals/MergeDupGoal/DuplicateFinder/DuplicateFinder";
import DomainTree from "../../TreeView/SemanticDomain";
import SpellChecker from "../Table/spellChecker";

export class NewGlossEntry extends React.Component {
  render() {
    return (
      <Grid
        item
        xs={5}
        style={{
          paddingLeft: theme.spacing(2),
          paddingRight: theme.spacing(2),
          position: "relative"
        }}
      >
        {/* Gloss new word entry */}

        <TextField
          label={<Translate id="addWords.glosses" />}
          fullWidth
          variant="outlined"
          value={row.glosses}
          onChange={e => {
            const isSpelledCorrectly = this.isSpelledCorrectly(e.target.value);
            this.updateRow(
              {
                ...row,
                glosses: e.target.value,
                glossSpelledCorrectly: isSpelledCorrectly
              },
              rowIndex
            );
          }}
          inputRef={this.glossInput}
          // Move the focus to the previous box when the left arrow key is pressed
          onKeyDown={e => {
            if (
              e.key === "ArrowLeft" &&
              (e.target as HTMLInputElement).selectionStart === 0
            )
              this.focusVernInput();
          }}
          InputProps={
            !row.glossSpelledCorrectly
              ? {
                  style: {
                    color: "red"
                  }
                }
              : {
                  style: {
                    color: "black"
                  }
                }
          }
        />
        {!row.glossSpelledCorrectly && (
          <Tooltip
            title={this.props.translate("addWords.mispelledWord") as string}
            placement="top"
          >
            <div
              style={{
                height: "5px",
                width: "5px",
                border: "2px solid red",
                borderRadius: "50%",
                position: "absolute",
                top: 24,
                right: 48,
                cursor: "pointer"
              }}
              onClick={() => this.toggleSpellingSuggestionsView(rowIndex)}
            />
          </Tooltip>
        )}
      </Grid>
    );
  }
}
