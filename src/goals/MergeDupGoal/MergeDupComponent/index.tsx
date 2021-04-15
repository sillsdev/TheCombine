import MergeDupsCompleted from "goals/MergeDupGoal/MergeDupComponent/MergeDupsCompleted";
import MergeDupStep from "goals/MergeDupGoal/MergeDupStep";

interface MergeDupsProps {
  completed: boolean;
}

export default function MergeDups(props: MergeDupsProps) {
  return props.completed ? <MergeDupsCompleted /> : <MergeDupStep />;
}
