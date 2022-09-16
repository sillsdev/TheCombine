import { SemanticDomainTreeNode } from "api";
import { DomainMap, newSemanticDomainTreeNode } from "types/semanticDomain";

export enum mapIds {
  "head" = "",
  "parent" = "1",
  "firstKid" = "1.0",
  "middleKid" = "1.1",
  "lastKid" = "1.2",
  "evenKid" = "1.0",
  "oddKid" = "1.1",
  "longKid" = "1.2",
  "depth3" = "1.2.1",
  "depth4" = "1.2.1.1",
  "depth5" = "1.2.1.1.1",
}

// Parent
const parent: SemanticDomainTreeNode = {
  ...newSemanticDomainTreeNode(mapIds.parent, "parent"),
  children: [],
};

const domMap: DomainMap = {};
domMap[mapIds.head] = {
  ...newSemanticDomainTreeNode("", "head"),
  children: [parent],
};
parent.parent = domMap[mapIds.head];
domMap[parent.id] = parent;

// Following children
for (let i = 0; i < 3; i++) {
  const id = "1." + i;
  const subdom: SemanticDomainTreeNode = {
    ...newSemanticDomainTreeNode(id, `kid${i}`),
    children: [],
    parent: parent,
  };
  subdom.previous = i > 0 ? domMap["1." + (i - 1)] : undefined;
  parent.children?.push(subdom);
  domMap[id] = subdom;
}

// now set the 'next' props for the first two children
domMap[mapIds.firstKid].next = domMap[mapIds.middleKid];
domMap[mapIds.middleKid].next = domMap[mapIds.lastKid];

// Give child 0 an even # of children
const dom0 = parent.children?.[0];
for (let i = 0; i < 4; i++) {
  const id = dom0?.id + "." + i;
  const subdom: SemanticDomainTreeNode = {
    ...newSemanticDomainTreeNode(id, `evenData${i}`),
  };
  domMap[dom0!.id].children!.push(newSemanticDomainTreeNode(id));
  domMap[id] = { ...subdom, parent: parent };
}

// Give the next subdomain an odd # of subdomains
const dom1 = parent.children?.[1];
for (let i = 0; i < 3; i++) {
  const id = dom1?.id + "." + i;
  const subdom: SemanticDomainTreeNode = {
    ...newSemanticDomainTreeNode(id, `oddData${i}`),
  };
  domMap[dom1!.id]?.children!.push(newSemanticDomainTreeNode(id));
  domMap[id] = { ...subdom, parent: parent };
}

// Give the last subdomain one subdomain with total depth of 5
const dom2 = parent.children![2] as SemanticDomainTreeNode;
let id = mapIds.depth3;
const dom20: SemanticDomainTreeNode = {
  ...newSemanticDomainTreeNode(id, "depth=3"),
  children: [],
};
dom2.children!.push(newSemanticDomainTreeNode(id));
dom20.parent = dom2;
domMap[id] = dom20;

id = mapIds.depth4;
const dom200: SemanticDomainTreeNode = {
  ...newSemanticDomainTreeNode(id, "depth=4"),
  children: [],
};
dom20.children!.push(dom200);
dom200.parent = dom20;
domMap[id] = dom200;
id = mapIds.depth5;
const domDepth5 = newSemanticDomainTreeNode(id, "depth=5");
domDepth5.parent = dom200;
domMap[id] = domDepth5;
export const jsonDomain = parent;

export default domMap;
