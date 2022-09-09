import { SemanticDomainTreeNode } from "api/models";
import {
  TreeViewAction,
  TreeActionType,
} from "components/TreeView/TreeViewActions";
import i18n from "i18n";
import { StoreAction, StoreActionTypes } from "rootActions";

export interface TreeViewState {
  currentDomain: SemanticDomainTreeNode;
  language: string;
  open: boolean;
}

export const defaultState: TreeViewState = {
  language: "",
  open: false,
  currentDomain: {
    guid: "",
    lang: i18n.language,
    id: "Sem",
    name: "",
    previous: undefined,
    next: undefined,
    parent: undefined,
  },
};

export const treeViewReducer = (
  state: TreeViewState = defaultState,
  action: StoreAction | TreeViewAction
): TreeViewState => {
  switch (action.type) {
    case TreeActionType.CLOSE_TREE:
      return { ...state, open: false };
    case TreeActionType.OPEN_TREE:
      return { ...state, open: true };
    case TreeActionType.SET_DOMAIN_LANGUAGE:
      if (!action.language) {
        throw new Error(
          "Cannot set domain map without a domain map and language."
        );
      }
      return {
        ...state,
        language: action.language,
      };
    case TreeActionType.TRAVERSE_TREE:
      if (!action.domain) {
        throw new Error("Cannot traverse tree without specifying domain.");
      }
      return { ...state };
    case TreeActionType.SET_CURRENT_DOMAIN:
      if (!action.domain) {
        throw new Error("Cannot set the current domain to undefined.");
      }
      return { ...state, currentDomain: action.domain };
    case StoreActionTypes.RESET:
      return defaultState;
    default:
      return state;
  }
};
