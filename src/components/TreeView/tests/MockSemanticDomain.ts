import SemanticDomainWithSubdomains from "types/SemanticDomain";

// Parent
const PAR: SemanticDomainWithSubdomains = {
  name: "parent",
  id: "1",
  subdomains: [],
  description: "parent desc",
  questions: [],
};

// Following subdomains
for (let i: number = 0; i < 3; i++)
  PAR.subdomains.push({
    name: "kid" + i,
    id: "1." + i,
    parentDomain: PAR,
    subdomains: [],
    description: `kid ${i}`,
    questions: [],
  });

// Give subdomain 0 an even # of subdomains
for (let i: number = 0; i < 4; i++)
  PAR.subdomains[0].subdomains.push({
    name: "evenData" + i,
    id: PAR.subdomains[0].id + "." + i,
    parentDomain: PAR.subdomains[0],
    subdomains: [],
    description: `evens ${i}`,
    questions: [],
  });

// Give the the next subdomain an odd # of subdomains
for (let i: number = 0; i < 3; i++)
  PAR.subdomains[1].subdomains.push({
    name: "oddData" + i,
    id: PAR.subdomains[1].id + "." + i,
    parentDomain: PAR.subdomains[1],
    subdomains: [],
    description: `odds ${i}`,
    questions: [],
  });

// Give the the last subdomain one subdomain
PAR.subdomains[2].subdomains.push({
  name: "soloData",
  id: PAR.subdomains[2].id + ".1",
  parentDomain: PAR.subdomains[2],
  subdomains: [],
  description: "so lonely...",
  questions: [],
});

//Extend the last subtree for a total depth of 5

PAR.subdomains[2].subdomains[0].subdomains.push({
  name: "depth=4",
  id: PAR.subdomains[2].subdomains[0].id + ".1",
  parentDomain: PAR.subdomains[2].subdomains[0],
  subdomains: [],
  description: "almost at the bottom...",
  questions: [],
});

PAR.subdomains[2].subdomains[0].subdomains[0].subdomains.push({
  name: "depth=5",
  id: PAR.subdomains[2].subdomains[0].subdomains[0].id + ".1",
  parentDomain: PAR.subdomains[2].subdomains[0].subdomains[0],
  subdomains: [],
  description: "ROCK BOTTOM",
  questions: [],
});

export default PAR;
