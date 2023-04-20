import { SemanticDomain, SemanticDomainTreeNode } from "api/models";
import { getSemanticDomainTreeNode } from "backend";
import { defaultState } from "components/TreeView/TreeViewReducer";
import {
  TreeActionType,
  TreeViewAction,
} from "components/TreeView/TreeViewReduxTypes";
import { StoreState } from "types";
import { StoreStateDispatch } from "types/Redux/actions";
import { Bcp47Code } from "types/writingSystem";

export function closeTreeAction(): TreeViewAction {
  return { type: TreeActionType.CLOSE_TREE };
}

export function openTreeAction(): TreeViewAction {
  return { type: TreeActionType.OPEN_TREE };
}

export function setDomainAction(
  domain: SemanticDomainTreeNode
): TreeViewAction {
  return { type: TreeActionType.SET_CURRENT_DOMAIN, domain };
}

export function setDomainLanguageAction(language: string): TreeViewAction {
  return { type: TreeActionType.SET_DOMAIN_LANGUAGE, language };
}

export function resetTreeAction(): TreeViewAction {
  return { type: TreeActionType.RESET_TREE };
}

export function traverseTree(domain: SemanticDomain) {
  return async (dispatch: StoreStateDispatch) => {
    if (domain) {
      getSemanticDomainTreeNode(domain.id, domain.lang).then((response) => {
        if (response) {
          dispatch(setDomainAction(response));
        }
      });
    }
  };
}

export function updateTreeLanguage(language: string) {
  return async (dispatch: StoreStateDispatch) => {
    if (language) {
      dispatch(setDomainLanguageAction(language));
    }
  };
}

export function initTreeDomain(language: string) {
  return async (dispatch: StoreStateDispatch, getState: () => StoreState) => {
    const currentDomain = getState().treeViewState.currentDomain;
    if (currentDomain === defaultState.currentDomain) {
      if (!currentDomain.lang) {
        currentDomain.lang = language ?? Bcp47Code.Default;
      }
      await dispatch(traverseTree(currentDomain));
    }
  };
}
