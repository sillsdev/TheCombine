import React from "react";
import Pronunciations from "../../../../components/Pronunciations";
import { ThunkDispatch } from "redux-thunk";
import { StoreState } from "../../../../types";
import {
  ReviewEntriesAction,
  refreshWord,
  deleteAudio,
  uploadAudio,
} from "../ReviewEntriesActions";
import { connect } from "react-redux";
import { Recorder } from "../../../../components/Pronunciations/Recorder";

interface Props {
  wordId: string;
  pronunciationFiles: string[];
  recorder?: Recorder;
  refreshWord?: (oldId: string, newId: string) => void;
  deleteAudio?: (wordId: string, fileName: string) => void;
  uploadAudio?: (wordId: string, audioFile: File) => void;
}

/** Used to connect the pronunciation component to the refreshWord, deleteAudio, uploadAudio actions */
class PronunciationsCell extends React.Component<Props> {
  render() {
    return (
      <Pronunciations
        wordId={this.props.wordId}
        pronunciationFiles={this.props.pronunciationFiles}
        recorder={this.props.recorder}
        refreshWord={this.props.refreshWord}
        deleteAudio={this.props.deleteAudio}
        uploadAudio={this.props.uploadAudio}
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
    deleteAudio: (wordId: string, fileName: string) =>
      dispatch(deleteAudio(wordId, fileName)),
    uploadAudio: (oldWordId: string, audioFile: File) =>
      dispatch(uploadAudio(oldWordId, audioFile)),
  };
}

export default connect(null, mapDispatchToProps)(PronunciationsCell);
