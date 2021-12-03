import React from "react";

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
  }

  async componentDidMount() {
    const frontier = await getFrontierWords();
    this.props.updateAllWords(
      frontier.map((w) => new ReviewEntriesWord(w, undefined, this.recorder))
    );
    this.setState({ loaded: true });
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
