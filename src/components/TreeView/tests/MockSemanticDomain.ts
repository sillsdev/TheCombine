import TreeSemanticDomain, {
  DomainMap,
} from "components/TreeView/TreeSemanticDomain";

// Parent
const PAR: TreeSemanticDomain = {
  ...new TreeSemanticDomain("1", "parent"),
  description: "parent desc",
};

export const parMap: DomainMap = {};

// Following subdomains
for (let i = 0; i < 3; i++) {
  const id = "1." + i;
  PAR.subdomains.push({
    ...new TreeSemanticDomain(id, `kid${i}`),
    description: `kid ${i}`,
  });
  parMap[id] = PAR;
}

// Give subdomain 0 an even # of subdomains
const dom0 = PAR.subdomains[0];
for (let i = 0; i < 4; i++) {
  const id = dom0.id + "." + i;
  dom0.subdomains.push({
    ...new TreeSemanticDomain(id, `evenData${i}`),
    description: `evens ${i}`,
  });
  parMap[id] = dom0;
}

// Give the the next subdomain an odd # of subdomains
const dom1 = PAR.subdomains[1];
for (let i = 0; i < 3; i++) {
  const id = dom1.id + "." + i;
  dom1.subdomains.push({
    ...new TreeSemanticDomain(id, `oddData${i}`),
    description: `odds ${i}`,
  });
  parMap[id] = dom1;
}

// Give the the last subdomain one subdomain with total depth of 5
const dom2 = PAR.subdomains[2];
let id = dom2.id + ".1";
dom2.subdomains.push({
  ...new TreeSemanticDomain(id, "depth=3"),
  description: "so lonely...",
});
parMap[id] = dom2;
const dom20 = dom2.subdomains[0];
id += ".1";
dom20.subdomains.push({
  ...new TreeSemanticDomain(id, "depth=4"),
  description: "almost at the bottom...",
});
parMap[id] = dom20;
const dom200 = dom20.subdomains[0];
id += ".1";
dom200.subdomains.push({
  ...new TreeSemanticDomain(id, "depth=5"),
  description: "ROCK BOTTOM",
});
parMap[id] = dom200;

export default PAR;
