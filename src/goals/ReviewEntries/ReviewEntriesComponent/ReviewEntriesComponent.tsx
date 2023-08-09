import { ReactElement, useEffect, useState } from "react";

import { getFrontierWords } from "backend";
import ReviewEntriesTable from "goals/ReviewEntries/ReviewEntriesComponent/ReviewEntriesTable";
import { ReviewEntriesWord } from "goals/ReviewEntries/ReviewEntriesComponent/ReviewEntriesTypes";
import { StoreState } from "types";
import { useAppSelector } from "types/hooks";

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
  const proj = useAppSelector(
    (state: StoreState) => state.currentProjectState.project
  );

  const [loaded, setLoaded] = useState(false);
  const { updateAllWords, updateFrontierWord } = props;

  const analysisLang = proj.analysisWritingSystems[0]?.bcp47;

  useEffect(() => {
    getFrontierWords().then((frontier) => {
      updateAllWords(
        frontier.map((w) => new ReviewEntriesWord(w, analysisLang))
      );
      setLoaded(true);
    });
  }, [analysisLang, proj.id, updateAllWords]);

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
