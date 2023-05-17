import {
  TreeNodeMap,
  newSemanticDomainTreeNode,
  semDomFromTreeNode,
} from "types/semanticDomain";

export enum mapIds {
  "head" = "Sem",
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

const nodeMap: TreeNodeMap = {};

// Head
const headNode = newSemanticDomainTreeNode(mapIds.head, "head");
nodeMap[headNode.id] = headNode;
const headDom = semDomFromTreeNode(headNode);

// Parent
const parentNode = newSemanticDomainTreeNode(mapIds.parent, "parent");
parentNode.parent = headDom;
nodeMap[parentNode.id] = parentNode;
const parentDom = semDomFromTreeNode(parentNode);
headNode.children.push(parentDom);

// Kids
for (let i = 0; i < 3; i++) {
  const id = "1." + i;
  const subdom = newSemanticDomainTreeNode(id, `kid${i}`);
  parentNode.children.push(semDomFromTreeNode(subdom));
  nodeMap[id] = { ...subdom, parent: parentDom };
}
const firstKid = nodeMap[mapIds.firstKid];
const middleKid = nodeMap[mapIds.middleKid];
const lastKid = nodeMap[mapIds.lastKid];
firstKid.next = semDomFromTreeNode(middleKid);
middleKid.previous = semDomFromTreeNode(firstKid);
middleKid.next = semDomFromTreeNode(lastKid);
lastKid.previous = semDomFromTreeNode(middleKid);

// Give firstKid an even # of children
for (let i = 0; i < 4; i++) {
  const id = firstKid.id + "." + i;
  const subdom = newSemanticDomainTreeNode(id, `evenData${i}`);
  firstKid.children.push(semDomFromTreeNode(subdom));
  nodeMap[id] = { ...subdom, parent: semDomFromTreeNode(firstKid) };
}

// Give middleKid an odd # of subdomains
for (let i = 0; i < 3; i++) {
  const id = middleKid.id + "." + i;
  const subdom = newSemanticDomainTreeNode(id, `oddData${i}`);
  subdom.parent = semDomFromTreeNode(middleKid);
  middleKid.children.push(semDomFromTreeNode(subdom));
  nodeMap[id] = { ...subdom, parent: parentDom };
}

// Give lastKid one subdomain with total depth of 5
let id = mapIds.depth3;
const domDepth3 = newSemanticDomainTreeNode(id, "depth=3");
lastKid.children.push(semDomFromTreeNode(domDepth3));
domDepth3.parent = semDomFromTreeNode(lastKid);
nodeMap[id] = domDepth3;

id = mapIds.depth4;
const domDepth4 = newSemanticDomainTreeNode(id, "depth=4");
domDepth3.children.push(semDomFromTreeNode(domDepth4));
domDepth4.parent = semDomFromTreeNode(domDepth3);
nodeMap[id] = domDepth4;

id = mapIds.depth5;
const domDepth5 = newSemanticDomainTreeNode(id, "depth=5");
domDepth5.parent = semDomFromTreeNode(domDepth4);
nodeMap[id] = domDepth5;

export default nodeMap;
