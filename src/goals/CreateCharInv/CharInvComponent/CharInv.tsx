import { ReactElement } from "react";

import CharInventoryCreation from "goals/CharInventoryCreation";
import CharInvCompleted from "goals/CreateCharInv/CharInvComponent/CharInvCompleted";

interface CharInvProps {
  completed: boolean;
}

export default function CharInv(props: CharInvProps): ReactElement {
  return props.completed ? <CharInvCompleted /> : <CharInventoryCreation />;
}
