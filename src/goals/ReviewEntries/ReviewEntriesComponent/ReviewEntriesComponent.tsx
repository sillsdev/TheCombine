import React from "react";

import { getFrontierWords } from "backend";
import Recorder from "components/Pronunciations/Recorder";
import ReviewEntriesTable from "goals/ReviewEntries/ReviewEntriesComponent/ReviewEntriesTable";
import {
  parseWord,
  ReviewEntriesWord,
} from "goals/ReviewEntries/ReviewEntriesComponent/ReviewEntriesTypes";
import { Word } from "types/word";

// Component state/props
interface ReviewEntriesProps {
  // Props mapped to store
  language: string;

  // Dispatch changes
  clearState: () => void;
  setAnalysisLanguage: () => void;
  updateAllWords: (words: ReviewEntriesWord[]) => void;
  updateFrontierWord: (
    newData: ReviewEntriesWord,
    oldData: ReviewEntriesWord,
    language: string
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
    this.props.setAnalysisLanguage();
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
      currentWord = parseWord(word, this.props.language, this.recorder);

      // Remove the trailing newlines + push to newWords
      newWords.push(currentWord);
    }
    this.props.updateAllWords(newWords);
  }

  private onRowUpdate = (
    newData: ReviewEntriesWord,
    oldData: ReviewEntriesWord
  ): Promise<void> =>
    new Promise(async (resolve) => {
      // Update database and update word ID.
      // Awaited so user can't edit and submit word with bad ID before it's updated.
      this.props
        .updateFrontierWord(newData, oldData, this.props.language)
        .then(() => {
          setTimeout(() => {
            resolve();
          }, 500);
        });
    });

  render() {
    return (
      this.state.loaded && (
        <ReviewEntriesTable
          onRowUpdate={(
            newData: ReviewEntriesWord,
            oldData: ReviewEntriesWord
          ) => this.onRowUpdate(newData, oldData)}
        />
      )
    );
  }
}
