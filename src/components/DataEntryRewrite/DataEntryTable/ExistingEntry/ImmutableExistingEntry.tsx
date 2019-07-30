import React from "react";
import { Grid, Typography } from "@material-ui/core";
import { Word, Gloss } from "../../../../types/word";
import DuplicateFinder from "../../../../goals/MergeDupGoal/DuplicateFinder/DuplicateFinder";
import SpellChecker from "../../../DataEntry/spellChecker";
import ExistingVernEntry from "./ExistingVernEntry/ExistingVernEntry";
import ExistingGlossEntry from "./ExistingGlossEntry/ExistingGlossEntry";
import DeleteEntry from "./DeleteEntry/DeleteEntry";
import { SpellingSuggestionsView } from "../SpellingSuggestions/SpellingSuggestions";
import { DuplicateResolutionView } from "../DuplicateResolutionView/DuplicateResolutionView";

interface ImmutableExistingEntryProps {
  vernacular: string;
  gloss: string;
}

export class ImmutableExistingEntry extends React.Component<
  ImmutableExistingEntryProps
> {
  render() {
    return (
      <Typography variant="h6">
        {"Vernacular: " +
          this.props.vernacular +
          ", Gloss: " +
          this.props.gloss}
      </Typography>
    );
  }
}
