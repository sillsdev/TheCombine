import { defaultState } from "./TreeViewReducer";
import { TreeActionType, TreeViewAction } from "./TreeViewReduxTypes";
import { SemanticDomain, SemanticDomainTreeNode } from "api/models";
import { getSemanticDomainTreeNode } from "backend";
import { StoreState } from "types";
import { StoreStateDispatch } from "types/Redux/actions";
import { Bcp47Code } from "types/writingSystem";

export function closeTreeAction(): TreeViewAction {
  return { type: TreeActionType.CLOSE_TREE };
}

export function openTreeAction(): TreeViewAction {
  return { type: TreeActionType.OPEN_TREE };
}

export function setDomainLanguageAction(language: string): TreeViewAction {
  return { type: TreeActionType.SET_DOMAIN_LANGUAGE, language };
}

export function traverseTreeAction(domain: SemanticDomain) {
  return async (dispatch: StoreStateDispatch) => {
    if (domain) {
      getSemanticDomainTreeNode(domain.id, domain.lang).then((response) => {
        if (response) {
          dispatch(setCurrentDomain(response));
        }
      });
    }
  };
}

export function setCurrentDomain(
  domain: SemanticDomainTreeNode
): TreeViewAction {
  return { type: TreeActionType.SET_CURRENT_DOMAIN, domain };
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
      dispatch(traverseTreeAction(currentDomain));
    }
  };
}
