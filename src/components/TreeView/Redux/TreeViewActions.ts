import { Action, PayloadAction } from "@reduxjs/toolkit";

import { SemanticDomain, SemanticDomainTreeNode } from "api/models";
import { getSemanticDomainTreeNode } from "backend";
import {
  resetTreeAction,
  setCurrentDomainAction,
  setDomainLanguageAction,
  setTreeOpenAction,
} from "components/TreeView/Redux/TreeViewReducer";
import { StoreState } from "types";
import { StoreStateDispatch } from "types/Redux/actions";

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
  return async (dispatch: StoreStateDispatch) => {
    if (domain.id) {
      const dom = await getSemanticDomainTreeNode(domain.id, domain.lang);
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
