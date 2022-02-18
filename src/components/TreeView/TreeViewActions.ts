import TreeSemanticDomain, {
  DomainMap,
} from "components/TreeView/TreeSemanticDomain";
import { StoreStateDispatch } from "types/Redux/actions";

export enum TreeActionType {
  CLOSE_TREE = "CLOSE_TREE",
  OPEN_TREE = "OPEN_TREE",
  SET_DOMAIN_MAP = "SET_DOMAIN_MAP",
  TRAVERSE_TREE = "TRAVERSE_TREE",
}

export interface TreeViewAction {
  type: TreeActionType;
  domain?: TreeSemanticDomain;
  domainMap?: DomainMap;
  language?: string;
}

export function closeTreeAction(): TreeViewAction {
  return { type: TreeActionType.CLOSE_TREE };
}

export function openTreeAction(): TreeViewAction {
  return { type: TreeActionType.OPEN_TREE };
}

export function setDomainMapAction(
  domainMap: DomainMap,
  language: string
): TreeViewAction {
  return { type: TreeActionType.SET_DOMAIN_MAP, domainMap, language };
}

export function traverseTreeAction(domain: TreeSemanticDomain): TreeViewAction {
  return { type: TreeActionType.TRAVERSE_TREE, domain };
}

// Split off subdomains and add domainIds
function mapDomain(
  domain: TreeSemanticDomain,
  domainMap: DomainMap,
  parentId?: string
): void {
  domain.parentId = parentId;
  domain.childIds = domain.subdomains.map((dom) => dom.id);
  for (const child of domain.subdomains) {
    mapDomain(child, domainMap, domain.id);
  }
  domain.subdomains = [];
  domainMap[domain.id] = domain;
}

/** Parses a list of semantic domains (to be loaded from file) */
export function createDomainMap(
  data: TreeSemanticDomain[],
  headString = ""
): DomainMap {
  const domain = new TreeSemanticDomain("", headString);
  domain.subdomains = data;
  const domainMap: DomainMap = {};
  mapDomain(domain, domainMap);
  return domainMap;
}

function loadLocalizedJson(languageKey: string): Promise<any> {
  return new Promise((res) => {
    import(`resources/semantic-domains/${languageKey}.json`).then((data) => {
      res(data?.default);
    });
  });
}

export function updateTreeLanguage(language: string, headString = "") {
  return async (dispatch: StoreStateDispatch) => {
    if (language) {
      const localizedDomains = await loadLocalizedJson(language);
      const domainMap = createDomainMap(localizedDomains, headString);
      dispatch(setDomainMapAction(domainMap, language));
    }
  };
}
