import { SemanticDomain, SemanticDomainTreeNode } from "api/models";
import { getSemanticDomainTreeNode } from "backend";
import {
  TreeActionType,
  TreeViewAction,
} from "components/TreeView/TreeViewReduxTypes";
import { StoreState } from "types";
import { StoreStateDispatch } from "types/Redux/actions";

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
      await getSemanticDomainTreeNode(domain.id, domain.lang).then(
        (response) => {
          if (response) {
            dispatch(setDomainAction(response));
          }
        }
      );
    }
  };
}

export function updateTreeLanguage(language: string) {
  return (dispatch: StoreStateDispatch) => {
    if (language) {
      dispatch(setDomainLanguageAction(language));
    }
  };
}

export function initTreeDomain(language = "") {
  return async (dispatch: StoreStateDispatch, getState: () => StoreState) => {
    const currentDomain = getState().treeViewState.currentDomain;
    currentDomain.lang = language;
    await dispatch(traverseTree(currentDomain));
  };
}
