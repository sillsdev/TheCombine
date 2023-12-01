import { ReactElement, useEffect, useState } from "react";

import { getFrontierWords } from "backend";
import {
  setAllWords,
  setSortBy,
  updateFrontierWord,
} from "goals/ReviewEntries/Redux/ReviewEntriesActions";
import ReviewEntriesCompleted from "goals/ReviewEntries/ReviewEntriesCompleted";
import ReviewEntriesTable from "goals/ReviewEntries/ReviewEntriesTable";
import {
  ColumnId,
  ReviewEntriesWord,
} from "goals/ReviewEntries/ReviewEntriesTypes";
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
    <ReviewEntriesTable
      onRowUpdate={(newData: ReviewEntriesWord, oldData?: ReviewEntriesWord) =>
        dispatch(updateFrontierWord(newData, oldData))
      }
      onSort={(columnId?: ColumnId) => dispatch(setSortBy(columnId))}
    />
  ) : (
    <div />
  );
}
