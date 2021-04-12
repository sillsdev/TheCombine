import { Typography } from "@material-ui/core";
import { ArrowRightAlt } from "@material-ui/icons";
import React from "react";
import { Translate } from "react-localize-redux";
import { useSelector } from "react-redux";

import { CompletedMerge, MergesCompleted } from "goals/MergeDupGoal/MergeDups";
import { StoreState } from "types";

export default function MergeDupsCompleted() {
  const changes = useSelector(
    (state: StoreState) =>
      state.goalsState.currentGoal.changes as MergesCompleted
  );
  return (
    <React.Fragment>
      <Typography component="h1" variant="h4">
        <Translate id="mergeDups.title" />
      </Typography>
      {MergesMade(changes)}
    </React.Fragment>
  );
}

function MergesMade(changes: MergesCompleted) {
  return (
    <div>
      <Typography>
        <Translate id="mergeDups.completed.number" />
        {changes.merges.length}
      </Typography>
      {changes.merges.map(MergeChange)}
    </div>
  );
}

function MergeChange(change: CompletedMerge) {
  return (
    <div>
      <Typography display="inline">{change.childrenIds.join(", ")}</Typography>
      <ArrowRightAlt fontSize="inherit" />
      <Typography display="inline">{change.parentIds.join(", ")}</Typography>
    </div>
  );
}
