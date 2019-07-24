import { Dispatch } from "react";
import { connect } from "react-redux";

import ViewFinalComponent, { ViewFinalWord } from "./ViewFinalComponent";
import {
  ViewFinalAction,
  updateGlosses,
  addDomain,
  deleteDomain,
  addSense,
  deleteSense,
  updateWords,
  updateVernacular,
  resetEdits,
  updateWord
} from "./ViewFinalActions";
import { SemanticDomain, Word } from "../../../types/word";
import { StoreState } from "../../../types";

function mapStateToProps(state: StoreState) {
  return {
    language: state.viewFinalState.language,
    words: state.viewFinalState.words,
    edits: state.viewFinalState.edits
  };
}

function mapDispatchToProps(dispatch: Dispatch<ViewFinalAction>) {
  return {
    updateVernacular: (id: string, newVernacular: string) => {
      dispatch(updateVernacular(id, newVernacular));
    },
    updateGlosses: (id: string, editId: string, newGlosses: string) => {
      dispatch(updateGlosses(id, editId, newGlosses));
    },
    addDomain: (id: string, senseId: string, newDomain: SemanticDomain) => {
      dispatch(addDomain(id, senseId, newDomain));
    },
    deleteDomain: (id: string, senseId: string, delDomain: SemanticDomain) => {
      dispatch(deleteDomain(id, senseId, delDomain));
    },
    addSense: (id: string) => {
      dispatch(addSense(id));
    },
    deleteSense: (id: string, senseId: string) => {
      dispatch(deleteSense(id, senseId));
    },
    updateWords: (words: ViewFinalWord[]) => {
      dispatch(updateWords(words));
    },
    updateWord: (id: string, newId: string, newWord?: ViewFinalWord) => {
      dispatch(updateWord(id, newId, newWord));
    },
    resetEdits: () => {
      dispatch(resetEdits());
    }
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ViewFinalComponent);
