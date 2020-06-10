import { Dispatch } from "redux";
import { connect } from "react-redux";
import { StoreState } from "../../types";
import { getTranslate } from "react-localize-redux";
import Pronunciations from "./PronunciationsComponent";
import {
  PronunciationsAction,
  deleteAudio,
  uploadAudio,
} from "./PronunciationsActions";

export function mapDispatchToProps(dispatch: Dispatch<PronunciationsAction>) {
  return {
    deleteAudio: (wordId: string, fileName: string) => {
      dispatch(deleteAudio(wordId, fileName));
    },
    uploadAudio: (wordId: string, audioFile: File) => {
      dispatch(uploadAudio(wordId, audioFile));
    },
  };
}

function mapStateToProps(state: StoreState) {
  return {
    translate: getTranslate(state.localize),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Pronunciations);
