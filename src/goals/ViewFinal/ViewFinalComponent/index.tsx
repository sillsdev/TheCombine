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
  updateVernacular
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
    updateGlosses: (id: string, editIndex: number, newGlosses: string) => {
      dispatch(updateGlosses(id, editIndex, newGlosses));
    },
    addDomain: (id: string, senseIndex: number, newDomain: SemanticDomain) => {
      dispatch(addDomain(id, senseIndex, newDomain));
    },
    deleteDomain: (
      id: string,
      senseIndex: number,
      delDomain: SemanticDomain
    ) => {
      dispatch(deleteDomain(id, senseIndex, delDomain));
    },
    addSense: (id: string) => {
      dispatch(addSense(id));
    },
    deleteSense: (id: string, deleteIndex: number) => {
      dispatch(deleteSense(id, deleteIndex));
    },
    updateWords: (words: ViewFinalWord[]) => {
      dispatch(updateWords(words));
    }
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ViewFinalComponent);
