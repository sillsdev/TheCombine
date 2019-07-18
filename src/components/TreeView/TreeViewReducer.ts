import { TreeViewAction, TreeActionType } from "./TreeViewActions";
import SemanticDomain from "./SemanticDomain";
import SemanticDomainTest from "../../resources/semantic.json";
import { StoreAction, StoreActions } from "../../rootActions";
const tempData: string = JSON.stringify(SemanticDomainTest); // temporary, will eventually get semantic domains from backend

export interface TreeViewState {
  currentDomain: SemanticDomain;
}

// Parses a list of semantic domains (to be received from backend)
function createDomains(data: string = tempData): TreeViewState {
  let state: TreeViewState = {
    currentDomain: {
      name: "Semantic Domains",
      id: "",
      subDomains: JSON.parse(data).domains
    }
  };
  addParentDomains(state.currentDomain);
  while (state.currentDomain.subDomains.length > 0)
    state.currentDomain = state.currentDomain.subDomains[0];
  return state;
}

// Adds the parent domains to the information sent by the backend
function addParentDomains(parent: SemanticDomain) {
  if (parent.subDomains)
    for (let domain of parent.subDomains) {
      domain.parentDomain = parent;
      addParentDomains(domain);
    }
  else parent.subDomains = [];
}
export const defaultState: TreeViewState = createDomains();

export const treeViewReducer = (
  state: TreeViewState = defaultState,
  action: StoreAction | TreeViewAction
): TreeViewState => {
  switch (action.type) {
    case TreeActionType.TRAVERSE_TREE:
      return { ...state, currentDomain: action.payload };
    case StoreActions.RESET:
      return defaultState;
    default:
      return state;
  }
};
