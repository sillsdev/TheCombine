import { SemanticDomain, SemanticDomainTreeNode } from "api/models";
import { getSemanticDomainTreeNode } from "backend";
import { StoreStateDispatch } from "types/Redux/actions";

export enum TreeActionType {
  CLOSE_TREE = "CLOSE_TREE",
  OPEN_TREE = "OPEN_TREE",
  SET_DOMAIN_LANGUAGE = "SET_DOMAIN_LANGUAGE",
  TRAVERSE_TREE = "TRAVERSE_TREE",
  SET_CURRENT_DOMAIN = "SET_CURRENT_DOMAIN",
}

export interface TreeViewAction {
  type: TreeActionType;
  domain?: SemanticDomain;
  language?: string;
}

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

export function updateTreeLanguage(language: string, headString = "") {
  return async (dispatch: StoreStateDispatch) => {
    if (language) {
      dispatch(setDomainLanguageAction(language));
    }
  };
}
