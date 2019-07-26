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

export class NewVernEntry extends React.Component {
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
        {/* Vernacular new word entry */}

        <TextField
          autoFocus
          label={<Translate id="addWords.vernacular" />}
          fullWidth
          variant="outlined"
          value={row.vernacular}
          onChange={e => {
            let dupId = this.vernInFrontier(e.target.value);
            this.updateRow(
              {
                ...row,
                vernacular: e.target.value,
                dupId: dupId
              },
              rowIndex
            );
          }}
          inputRef={this.vernInput}
          // Move the focus to the next box when the right arrow key is pressed
          onKeyDown={e => {
            if (
              e.key === "ArrowRight" &&
              (e.target as HTMLInputElement).selectionStart ===
                this.state.rows[rowIndex].vernacular.length
            )
              this.focusGlossInput();
          }}
        />
        {this.state.rows[rowIndex].dupId !== "" && (
          <Tooltip
            title={this.props.translate("addWords.wordInDatabase") as string}
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
              onClick={() => this.toggleDuplicateVernacularView(rowIndex)}
            />
          </Tooltip>
        )}
      </Grid>
    );
  }
}
