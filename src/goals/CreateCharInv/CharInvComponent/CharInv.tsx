import { ArrowRightAlt } from "@material-ui/icons";
import React from "react";
import { Translate } from "react-localize-redux";

import { Typography } from "@material-ui/core";
import CharInventoryCreation from "goals/CharInventoryCreation";
import { CharacterChange } from "goals/CharInventoryCreation/CharacterInventoryActions";
import CharacterStatusText from "goals/CharInventoryCreation/components/CharacterList/CharacterStatusText";
import { CreateCharInvChanges } from "goals/CreateCharInv/CreateCharInv";
import { Goal } from "types/goals";

interface CharInvProps {
  goal: Goal;
}

export default function CharInv(props: CharInvProps) {
  const changes = props.goal.changes as CreateCharInvChanges;
  const completed = props.goal.completed || changes.charChanges?.length > 0;
  if (!completed) {
    return <CharInventoryCreation goal={props.goal} />;
  }
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
  return changes.charChanges.map((c) => CharInvChange(c));
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
