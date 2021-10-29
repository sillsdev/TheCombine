import { Typography } from "@material-ui/core";
import { ArrowRightAlt } from "@material-ui/icons";
import React from "react";
import { Translate } from "react-localize-redux";
import { useSelector } from "react-redux";

import { CharacterChange } from "goals/CharInventoryCreation/Redux/CharacterInventoryReduxTypes";
import CharacterStatusText from "goals/CharInventoryCreation/components/CharacterList/CharacterStatusText";
import { CreateCharInvChanges } from "goals/CreateCharInv/CreateCharInvTypes";
import { StoreState } from "types";

export default function CharInvCompleted() {
  const changes = useSelector(
    (state: StoreState) =>
      state.goalsState.currentGoal.changes as CreateCharInvChanges
  );
  return (
    <React.Fragment>
      <Typography component="h1" variant="h4">
        <Translate id="charInventory.title" />
      </Typography>
      {CharInvChangesMade(changes)}
    </React.Fragment>
  );
}

function CharInvChangesMade(changes: CreateCharInvChanges) {
  if (!changes.charChanges?.length) {
    return (
      <Typography>
        <Translate id="charInventory.changes.noChanges" />
      </Typography>
    );
  }
  return changes.charChanges.map(CharInvChange);
}

export function CharInvChangesGoalList(changes: CreateCharInvChanges) {
  const changeLimit = 3;
  if (!changes.charChanges?.length) {
    return (
      <Typography>
        <Translate id="charInventory.changes.noChanges" />
      </Typography>
    );
  }
  if (changes.charChanges.length > changeLimit) {
    return (
      <React.Fragment>
        <Typography />
        {changes.charChanges.slice(0, changeLimit - 1).map(CharInvChange)}
        <Typography>
          {`+${changes.charChanges.length - 3} `}
          <Translate id="charInventory.changes.more" />
        </Typography>
      </React.Fragment>
    );
  }
  return (
    <React.Fragment>
      <Typography />
      {changes.charChanges.map(CharInvChange)}
    </React.Fragment>
  );
}

function CharInvChange(change: CharacterChange) {
  return (
    <React.Fragment key={change[0]}>
      <Typography display="inline">{`${change[0]}: `}</Typography>
      <CharacterStatusText status={change[1]} inline />
      <ArrowRightAlt fontSize="inherit" />
      <CharacterStatusText status={change[2]} inline />
      <Typography />
    </React.Fragment>
  );
}
