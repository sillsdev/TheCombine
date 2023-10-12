import { ReactElement } from "react";

import MergeDupsCompleted from "goals/MergeDuplicates/MergeDupsCompleted";
import MergeDupsStep from "goals/MergeDuplicates/MergeDupsStep";

interface ReviewDeferredDupsProps {
  completed: boolean;
}

export default function ReviewDeferredDuplicates(
  props: ReviewDeferredDupsProps
): ReactElement {
  return props.completed ? <MergeDupsCompleted /> : <MergeDupsStep />;
}
