import { ReactElement, useEffect, useState } from "react";

import { getFrontierWords } from "backend";
import { setAllWords } from "goals/ReviewEntries/Redux/ReviewEntriesActions";
import ReviewEntriesCompleted from "goals/ReviewEntries/ReviewEntriesCompleted";
import ReviewEntriesTable from "goals/ReviewEntries/ReviewEntriesTable";
import { useAppDispatch } from "types/hooks";

interface ReviewEntriesProps {
  completed: boolean;
}

export default function ReviewEntries(props: ReviewEntriesProps): ReactElement {
  const dispatch = useAppDispatch();
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!props.completed) {
      getFrontierWords().then((frontier) => {
        dispatch(setAllWords(frontier));
        setLoaded(true);
      });
    }
  }, [dispatch, props.completed]);

  return props.completed ? (
    <ReviewEntriesCompleted />
  ) : loaded ? (
    <ReviewEntriesTable />
  ) : (
    <div />
  );
}
