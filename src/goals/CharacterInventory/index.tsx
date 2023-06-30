import { ReactElement } from "react";

import CharInv from "goals/CharacterInventory/CharInv";
import CharInvCompleted from "goals/CharacterInventory/CharInvCompleted";

interface CharacterInventoryProps {
  completed: boolean;
}

export default function CharacterInventory(
  props: CharacterInventoryProps
): ReactElement {
  return props.completed ? <CharInvCompleted /> : <CharInv />;
}
