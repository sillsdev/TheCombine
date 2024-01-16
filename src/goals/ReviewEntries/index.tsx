import { ReactElement } from "react";

import ReviewEntriesCompleted from "goals/ReviewEntries/ReviewEntriesCompleted";
import ReviewEntriesTable from "goals/ReviewEntries/ReviewEntriesTable";

interface ReviewEntriesProps {
  completed: boolean;
}

export default function ReviewEntries(props: ReviewEntriesProps): ReactElement {
  return props.completed ? <ReviewEntriesCompleted /> : <ReviewEntriesTable />;
}
