import { ReactElement, useEffect, useState } from "react";

import { getFrontierWords } from "backend";
import {
  updateAllWords,
  updateFrontierWord,
} from "goals/ReviewEntries/ReviewEntriesComponent/Redux/ReviewEntriesActions";
import ReviewEntriesTable from "goals/ReviewEntries/ReviewEntriesComponent/ReviewEntriesTable";
import { ReviewEntriesWord } from "goals/ReviewEntries/ReviewEntriesComponent/ReviewEntriesTypes";
import { useAppDispatch } from "types/hooks";

export default function ReviewEntriesComponent(): ReactElement {
  const dispatch = useAppDispatch();
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    getFrontierWords().then((frontier) => {
      dispatch(updateAllWords(frontier.map((w) => new ReviewEntriesWord(w))));
      setLoaded(true);
    });
  }, [dispatch]);

  return loaded ? (
    <ReviewEntriesTable
      onRowUpdate={(newData: ReviewEntriesWord, oldData: ReviewEntriesWord) =>
        dispatch(updateFrontierWord(newData, oldData))
      }
    />
  ) : (
    <div />
  );
}
