import TreeSemanticDomain, {
  DomainMap,
} from "components/TreeView/TreeSemanticDomain";

// Parent
const PAR: TreeSemanticDomain = {
  ...new TreeSemanticDomain("1", "parent"),
  description: "parent desc",
};

export const parMap: DomainMap = {};
parMap[""] = { ...new TreeSemanticDomain(), childIds: [PAR.id] };
parMap[PAR.id] = { ...PAR, parentId: "" };

// Following subdomains
for (let i = 0; i < 3; i++) {
  const id = "1." + i;
  const subdom: TreeSemanticDomain = {
    ...new TreeSemanticDomain(id, `kid${i}`),
    description: `kid ${i}`,
  };
  PAR.subdomains.push(subdom);
  parMap[PAR.id].childIds.push(id);
  parMap[id] = { ...subdom, parentId: PAR.id };
}

// Give subdomain 0 an even # of subdomains
const dom0 = PAR.subdomains[0];
for (let i = 0; i < 4; i++) {
  const id = dom0.id + "." + i;
  const subdom: TreeSemanticDomain = {
    ...new TreeSemanticDomain(id, `evenData${i}`),
    description: `evens ${i}`,
  };
  dom0.subdomains.push(subdom);
  parMap[dom0.id].childIds.push(id);
  parMap[id] = { ...subdom, parentId: dom0.id };
}

// Give the the next subdomain an odd # of subdomains
const dom1 = PAR.subdomains[1];
for (let i = 0; i < 3; i++) {
  const id = dom1.id + "." + i;
  const subdom: TreeSemanticDomain = {
    ...new TreeSemanticDomain(id, `oddData${i}`),
    description: `odds ${i}`,
  };
  dom1.subdomains.push(subdom);
  parMap[dom1.id].childIds.push(id);
  parMap[id] = { ...subdom, parentId: dom1.id };
}

// Give the the last subdomain one subdomain with total depth of 5
const dom2 = PAR.subdomains[2];
let id = dom2.id + ".1";
const dom20 = {
  ...new TreeSemanticDomain(id, "depth=3"),
  description: "so lonely...",
};
dom2.subdomains.push(dom20);
parMap[dom2.id].childIds.push(id);
parMap[id] = { ...dom20, parentId: dom2.id };

id += ".1";
const dom200: TreeSemanticDomain = {
  ...new TreeSemanticDomain(id, "depth=4"),
  description: "almost at the bottom...",
};
dom20.subdomains.push(dom200);
parMap[dom20.id].childIds.push(id);
parMap[id] = { ...dom200, parentId: dom20.id };
id += ".1";
dom200.subdomains.push({
  ...new TreeSemanticDomain(id, "depth=5"),
  description: "ROCK BOTTOM",
});
parMap[dom200.id].childIds.push(id);
parMap[id] = { ...dom200.subdomains[0], parentId: dom200.id };

export default PAR;
