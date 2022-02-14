import TreeSemanticDomain, {
  DomainMap,
} from "components/TreeView/TreeSemanticDomain";
import {
  TreeViewAction,
  TreeActionType,
} from "components/TreeView/TreeViewActions";
import { StoreAction, StoreActionTypes } from "rootActions";

export interface TreeViewState {
  currentDomain: TreeSemanticDomain;
  domainMap: DomainMap;
  open?: boolean;
}

// Parses a list of semantic domains (to be loaded from file)
export function createDomains(data: TreeSemanticDomain[]): TreeViewState {
  const currentDomain = new TreeSemanticDomain();
  currentDomain.subdomains = data;
  const domainMap: DomainMap = {};
  mapDomain(currentDomain, domainMap);
  return { currentDomain, domainMap };
}

// Split off subdomains and add domainIds
function mapDomain(
  domain: TreeSemanticDomain,
  domainMap: DomainMap,
  parentId?: string
) {
  domain.parentId = parentId;
  domain.childIds = domain.subdomains.map((dom) => dom.id);
  for (const child of domain.subdomains) {
    mapDomain(child, domainMap, domain.id);
  }
  domain.subdomains = [];
  domainMap[domain.id] = domain;
}

// Creates a dummy default state
export const defaultState: TreeViewState = {
  open: false,
  domainMap: {},
  currentDomain: new TreeSemanticDomain(),
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
    case TreeActionType.TRAVERSE_TREE:
      if (!action.domain) {
        throw new Error("Cannot traverse tree without specifying domain.");
      }
      return { ...state, currentDomain: action.domain };
    case TreeActionType.SET_PARENT_MAP:
      if (!action.domainMap) {
        throw new Error("Cannot set parent map without a parent map.");
      }
      return { ...state, domainMap: action.domainMap };
    case StoreActionTypes.RESET:
      return defaultState;
    default:
      return state;
  }
};
