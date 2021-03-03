import React from "react";

import { getFrontierWords } from "backend";
import Recorder from "components/Pronunciations/Recorder";
import ReviewEntriesTable from "goals/ReviewEntries/ReviewEntriesComponent/ReviewEntriesTable";
import { ReviewEntriesWord } from "goals/ReviewEntries/ReviewEntriesComponent/ReviewEntriesTypes";
import { Word } from "types/word";

// Component state/props
interface ReviewEntriesProps {
  // Dispatch changes
  clearState: () => void;
  updateAllWords: (words: ReviewEntriesWord[]) => void;
  updateFrontierWord: (
    newData: ReviewEntriesWord,
    oldData: ReviewEntriesWord
  ) => Promise<void>;
}

interface ReviewEntriesState {
  loaded: boolean;
}

export default class ReviewEntriesComponent extends React.Component<
  ReviewEntriesProps,
  ReviewEntriesState
> {
  recorder: Recorder;

  constructor(props: ReviewEntriesProps) {
    super(props);
    this.state = { loaded: false };
    this.recorder = new Recorder();
    this.props.clearState();
    getFrontierWords().then((frontier: Word[]) => {
      this.updateLocalWords(frontier);
      this.setState({ loaded: true });
    });
  }

  // Creates the local set of words from the frontier
  private updateLocalWords(frontier: Word[]) {
    let newWords: ReviewEntriesWord[] = [];
    let currentWord: ReviewEntriesWord;

    for (let word of frontier) {
      // Create a new currentword
      currentWord = new ReviewEntriesWord(word, undefined, this.recorder);

      // Remove the trailing newlines + push to newWords
      newWords.push(currentWord);
    }
    this.props.updateAllWords(newWords);
  }

  render() {
    return (
      this.state.loaded && (
        <ReviewEntriesTable
          onRowUpdate={(
            newData: ReviewEntriesWord,
            oldData: ReviewEntriesWord
          ) => this.props.updateFrontierWord(newData, oldData)}
        />
      )
    );
  }
}
