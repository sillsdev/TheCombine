import React from "react";

import CharInventoryCreation from "goals/CharInventoryCreation";
import CharInvCompleted from "goals/CreateCharInv/CharInvComponent/CharInvCompleted";
import { Goal } from "types/goals";

interface CharInvProps {
  goal: Goal;
}

export default function CharInv(props: CharInvProps) {
  return props.goal.completed ? (
    <CharInvCompleted goal={props.goal} />
  ) : (
    <CharInventoryCreation goal={props.goal} />
  );
}
