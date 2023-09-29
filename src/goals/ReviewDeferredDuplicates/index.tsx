import MergeDupsCompleted from "goals/MergeDuplicates/MergeDupsCompleted";
import MergeDupsStep from "goals/MergeDuplicates/MergeDupsStep";

interface ReviewDeferredDupsProps {
  completed: boolean;
}

export default function ReviewDeferredDuplicates(
  props: ReviewDeferredDupsProps
) {
  return props.completed ? <MergeDupsCompleted /> : <MergeDupsStep />;
}
