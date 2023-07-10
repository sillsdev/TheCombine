import { ReactElement, useEffect, useMemo, useState } from "react";

import { getFrontierWords } from "backend";
import Recorder from "components/Pronunciations/Recorder";
import ReviewEntriesTable from "goals/ReviewEntries/ReviewEntriesComponent/ReviewEntriesTable";
import { ReviewEntriesWord } from "goals/ReviewEntries/ReviewEntriesComponent/ReviewEntriesTypes";

// Component state/props
interface ReviewEntriesProps {
  // Dispatch changes
  updateAllWords: (words: ReviewEntriesWord[]) => void;
  updateFrontierWord: (
    newData: ReviewEntriesWord,
    oldData: ReviewEntriesWord
  ) => Promise<void>;
}

export default function ReviewEntriesComponent(
  props: ReviewEntriesProps
): ReactElement {
  const [loaded, setLoaded] = useState(false);
  const recorder = useMemo(() => new Recorder(), []);
  const { updateAllWords, updateFrontierWord } = props;

  useEffect(() => {
    getFrontierWords().then((frontier) => {
      updateAllWords(
        frontier.map((w) => new ReviewEntriesWord(w, undefined, recorder))
      );
      setLoaded(true);
    });
  }, [updateAllWords, recorder]);

  return loaded ? (
    <ReviewEntriesTable
      onRowUpdate={(newData: ReviewEntriesWord, oldData: ReviewEntriesWord) =>
        updateFrontierWord(newData, oldData)
      }
    />
  ) : (
    <div />
  );
}
