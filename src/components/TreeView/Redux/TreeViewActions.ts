import { type Action, type PayloadAction } from "@reduxjs/toolkit";

import { type SemanticDomain, type SemanticDomainTreeNode } from "api/models";
import {
  resetTreeAction,
  setCurrentDomainAction,
  setDomainLanguageAction,
  setTreeOpenAction,
} from "components/TreeView/Redux/TreeViewReducer";
import { getAugmentedTreeNode } from "components/TreeView/utilities";
import { type StoreState, type StoreStateDispatch } from "rootRedux/types";

// Action Creation Functions

export function closeTree(): PayloadAction {
  return setTreeOpenAction(false);
}

export function openTree(): PayloadAction {
  return setTreeOpenAction(true);
}

export function resetTree(): Action {
  return resetTreeAction();
}

export function setCurrentDomain(
  domain: SemanticDomainTreeNode
): PayloadAction {
  return setCurrentDomainAction(domain);
}

export function setDomainLanguage(language: string): PayloadAction {
  return setDomainLanguageAction(language);
}

// Dispatch Functions

export function traverseTree(domain: SemanticDomain) {
  return async (dispatch: StoreStateDispatch, getState: () => StoreState) => {
    const { id, lang } = domain;
    if (id) {
      const customDoms = getState().currentProjectState.project.semanticDomains;
      const dom = await getAugmentedTreeNode(id, lang, customDoms);
      if (dom) {
        dispatch(setCurrentDomain(dom));
      }
    }
  };
}

export function initTreeDomain(lang = "") {
  return async (dispatch: StoreStateDispatch, getState: () => StoreState) => {
    await dispatch(
      traverseTree({ ...getState().treeViewState.currentDomain, lang })
    );
  };
}
