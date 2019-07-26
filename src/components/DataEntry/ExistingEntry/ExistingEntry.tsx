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
import { NewVernEntry } from "./NewVernEntry.tsx/NewVernEntry";
import { NewGlossEntry } from "./NewGlossEntry.tsx/NewGlossEntry";
import { ExistingVernEntry } from "./ExistingVernEntry/ExistingVernEntry";
import { ExistingGlossEntry } from "./ExistingGlossEntry/ExistingGlossEntry";
import { DeleteRow } from "./DeleteRow/DeleteRow";

export class ExistingEntry extends React.Component {
  render() {
    return (
      <React.Fragment>
        <Grid container>
          <Grid
            item
            xs={12}
            key={rowIndex}
            onMouseEnter={() => {
              this.setState({ hoverIndex: rowIndex });
            }}
            onMouseLeave={() => {
              this.setState({ hoverIndex: undefined });
            }}
          >
            <ExistingVernEntry />
            <ExistingGlossEntry />
            <DeleteRow />
          </Grid>
        </Grid>
      </React.Fragment>
    );
  }
}
