import { DomainMap, TreeSemanticDomain } from "types/semanticDomain";

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
const parent: TreeSemanticDomain = {
  ...new TreeSemanticDomain(mapIds.parent, "parent"),
  description: "parent desc",
};

const domMap: DomainMap = {};
domMap[mapIds.head] = { ...new TreeSemanticDomain(), childIds: [parent.id] };
domMap[parent.id] = { ...parent, parentId: mapIds.head };

// Following subdomains
for (let i = 0; i < 3; i++) {
  const id = "1." + i;
  const subdom: TreeSemanticDomain = {
    ...new TreeSemanticDomain(id, `kid${i}`),
    description: `kid ${i}`,
  };
  parent.subdomains.push(subdom);
  domMap[parent.id].childIds.push(id);
  domMap[id] = { ...subdom, parentId: parent.id };
}

// Give subdomain 0 an even # of subdomains
const dom0 = parent.subdomains[0];
for (let i = 0; i < 4; i++) {
  const id = dom0.id + "." + i;
  const subdom: TreeSemanticDomain = {
    ...new TreeSemanticDomain(id, `evenData${i}`),
    description: `evens ${i}`,
  };
  dom0.subdomains.push(subdom);
  domMap[dom0.id].childIds.push(id);
  domMap[id] = { ...subdom, parentId: dom0.id };
}

// Give the next subdomain an odd # of subdomains
const dom1 = parent.subdomains[1];
for (let i = 0; i < 3; i++) {
  const id = dom1.id + "." + i;
  const subdom: TreeSemanticDomain = {
    ...new TreeSemanticDomain(id, `oddData${i}`),
    description: `odds ${i}`,
  };
  dom1.subdomains.push(subdom);
  domMap[dom1.id].childIds.push(id);
  domMap[id] = { ...subdom, parentId: dom1.id };
}

// Give the last subdomain one subdomain with total depth of 5
const dom2 = parent.subdomains[2];
let id = mapIds.depth3;
const dom20 = {
  ...new TreeSemanticDomain(id, "depth=3"),
  description: "so lonely...",
};
dom2.subdomains.push(dom20);
domMap[dom2.id].childIds.push(id);
domMap[id] = { ...dom20, parentId: dom2.id };

id = mapIds.depth4;
const dom200: TreeSemanticDomain = {
  ...new TreeSemanticDomain(id, "depth=4"),
  description: "almost at the bottom...",
};
dom20.subdomains.push(dom200);
domMap[dom20.id].childIds.push(id);
domMap[id] = { ...dom200, parentId: dom20.id };
id = mapIds.depth5;
dom200.subdomains.push({
  ...new TreeSemanticDomain(id, "depth=5"),
  description: "ROCK BOTTOM",
});
domMap[dom200.id].childIds.push(id);
domMap[id] = { ...dom200.subdomains[0], parentId: dom200.id };

export const jsonDomain = parent;

export default domMap;
