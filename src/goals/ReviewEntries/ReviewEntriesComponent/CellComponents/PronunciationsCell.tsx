import React from "react";
import Pronunciations from "../../../../components/Pronunciations";
import { ThunkDispatch } from "redux-thunk";
import { StoreState } from "../../../../types";
import { ReviewEntriesAction, refreshWord } from "../ReviewEntriesActions";
import { connect } from "react-redux";

interface Props {
  wordId: string;
  pronunciationFiles: string[];
  refreshWord: (oldId: string, newId: string) => void;
}

/** Used to connect the pronunciation component to the refreshWord action */
class PronunciationsCell extends React.Component<Props> {
  render() {
    return (
      <Pronunciations
        wordId={this.props.wordId}
        pronunciationFiles={this.props.pronunciationFiles}
        wordUpdated={this.props.refreshWord}
      />
    );
  }
}

function mapDispatchToProps(
  dispatch: ThunkDispatch<StoreState, any, ReviewEntriesAction>
) {
  return {
    refreshWord: (oldWordId: string, newWordId: string) =>
      dispatch(refreshWord(oldWordId, newWordId))
  };
}

export default connect(
  null,
  mapDispatchToProps
)(PronunciationsCell);
