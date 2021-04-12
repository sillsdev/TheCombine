import MergeDupsCompleted from "goals/MergeDupGoal/MergeDupComponent/MergeDupsCompleted";
import MergeDupStep from "goals/MergeDupGoal/MergeDupStep";

interface MergeDups {
  completed: boolean;
}

export default function MergeDups(props: MergeDups) {
  return props.completed ? <MergeDupsCompleted /> : <MergeDupStep />;
}
