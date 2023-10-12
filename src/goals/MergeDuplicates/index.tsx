import { ReactElement } from "react";

import MergeDupsCompleted from "goals/MergeDuplicates/MergeDupsCompleted";
import MergeDupsStep from "goals/MergeDuplicates/MergeDupsStep";

interface MergeDupsProps {
  completed: boolean;
}

export default function MergeDups(props: MergeDupsProps): ReactElement {
  return props.completed ? <MergeDupsCompleted /> : <MergeDupsStep />;
}
