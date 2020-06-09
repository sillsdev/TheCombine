import React from "react";
import Pronunciations from "../../../../components/Pronunciations";
import { ThunkDispatch } from "redux-thunk";
import { StoreState } from "../../../../types";
import { ReviewEntriesAction, refreshWord } from "../ReviewEntriesActions";
import { connect } from "react-redux";
import { Recorder } from "../../../../components/Pronunciations/Recorder";

interface Props {
  wordId: string;
  pronunciationFiles: string[];
  recorder?: Recorder;
  refreshWord?: (oldId: string, newId: string) => void;
}

/** Used to connect the pronunciation component to the refreshWord action */
class PronunciationsCell extends React.Component<Props> {
  render() {
    return (
      <Pronunciations
        wordId={this.props.wordId}
        pronunciationFiles={this.props.pronunciationFiles}
        recorder={this.props.recorder}
        refreshWord={this.props.refreshWord}
      />
    );
  }
}

function mapDispatchToProps(
  dispatch: ThunkDispatch<StoreState, any, ReviewEntriesAction>
) {
  return {
    refreshWord: (oldWordId: string, newWordId: string) =>
      dispatch(refreshWord(oldWordId, newWordId)),
  };
}

export default connect(null, mapDispatchToProps)(PronunciationsCell);
