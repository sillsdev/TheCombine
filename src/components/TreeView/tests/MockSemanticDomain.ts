import TreeSemanticDomain from "components/TreeView/TreeSemanticDomain";

// Parent
const PAR: TreeSemanticDomain = {
  ...new TreeSemanticDomain(),
  name: "parent",
  id: "1",
  description: "parent desc",
};

// Following subdomains
for (let i = 0; i < 3; i++)
  PAR.subdomains.push({
    ...new TreeSemanticDomain(),
    name: "kid" + i,
    id: "1." + i,
    parentDomain: PAR,
    description: `kid ${i}`,
  });

// Give subdomain 0 an even # of subdomains
for (let i = 0; i < 4; i++)
  PAR.subdomains[0].subdomains.push({
    ...new TreeSemanticDomain(),
    name: "evenData" + i,
    id: PAR.subdomains[0].id + "." + i,
    parentDomain: PAR.subdomains[0],
    description: `evens ${i}`,
  });

// Give the the next subdomain an odd # of subdomains
for (let i = 0; i < 3; i++)
  PAR.subdomains[1].subdomains.push({
    ...new TreeSemanticDomain(),
    name: "oddData" + i,
    id: PAR.subdomains[1].id + "." + i,
    parentDomain: PAR.subdomains[1],
    description: `odds ${i}`,
  });

// Give the the last subdomain one subdomain
PAR.subdomains[2].subdomains.push({
  ...new TreeSemanticDomain(),
  name: "soloData",
  id: PAR.subdomains[2].id + ".1",
  parentDomain: PAR.subdomains[2],
  description: "so lonely...",
});

//Extend the last subtree for a total depth of 5

PAR.subdomains[2].subdomains[0].subdomains.push({
  ...new TreeSemanticDomain(),
  name: "depth=4",
  id: PAR.subdomains[2].subdomains[0].id + ".1",
  parentDomain: PAR.subdomains[2].subdomains[0],
  description: "almost at the bottom...",
});

PAR.subdomains[2].subdomains[0].subdomains[0].subdomains.push({
  ...new TreeSemanticDomain(),
  name: "depth=5",
  id: PAR.subdomains[2].subdomains[0].subdomains[0].id + ".1",
  parentDomain: PAR.subdomains[2].subdomains[0].subdomains[0],
  description: "ROCK BOTTOM",
});

export default PAR;
