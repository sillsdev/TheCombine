import MergeDupsCompleted from "goals/MergeDuplicates/MergeDupsCompleted";
import MergeDupsStep from "goals/MergeDuplicates/MergeDupsStep";

interface MergeDupsProps {
  completed: boolean;
}

export default function MergeDups(props: MergeDupsProps) {
  return props.completed ? <MergeDupsCompleted /> : <MergeDupsStep />;
}
