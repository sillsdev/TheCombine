import React from "react";
import { connect } from "react-redux";
import { ThunkDispatch } from "redux-thunk";

import Pronunciations from "../../../../components/Pronunciations/PronunciationsComponent";
import Recorder from "../../../../components/Pronunciations/Recorder";
import { StoreState } from "../../../../types";
import {
  deleteAudio,
  ReviewEntriesAction,
  uploadAudio,
} from "../ReviewEntriesActions";

interface PronunciationCellProps {
  wordId: string;
  pronunciationFiles: string[];
  recorder?: Recorder;
  deleteAudio?: (wordId: string, fileName: string) => void;
  uploadAudio?: (wordId: string, audioFile: File) => void;
}

/** Used to connect the pronunciation component to the deleteAudio and uploadAudio actions */
class PronunciationsCell extends React.Component<PronunciationCellProps> {
  render() {
    return (
      <Pronunciations
        wordId={this.props.wordId}
        pronunciationFiles={this.props.pronunciationFiles}
        recorder={this.props.recorder}
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
    deleteAudio: (wordId: string, fileName: string) =>
      dispatch(deleteAudio(wordId, fileName)),
    uploadAudio: (oldWordId: string, audioFile: File) =>
      dispatch(uploadAudio(oldWordId, audioFile)),
  };
}

export default connect(null, mapDispatchToProps)(PronunciationsCell);
