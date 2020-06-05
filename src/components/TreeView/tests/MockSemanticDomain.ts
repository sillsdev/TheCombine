import SemanticDomainWithSubdomains from "../SemanticDomain";

// Parent
const PAR: SemanticDomainWithSubdomains = {
  name: "parent",
  id: "1",
  subdomains: [],
  description: "parent desc",
};

// Following subdomains
for (let i: number = 0; i < 3; i++)
  PAR.subdomains.push({
    name: "kid" + i,
    id: "1." + i,
    parentDomain: PAR,
    subdomains: [],
    description: `kid ${i}`,
  });

// Give subdomain 0 an even # of subdomains
for (let i: number = 0; i < 4; i++)
  PAR.subdomains[0].subdomains.push({
    name: "evenData" + i,
    id: PAR.subdomains[0].id + "." + i,
    parentDomain: PAR.subdomains[0],
    subdomains: [],
    description: `evens ${i}`,
  });

// Give the the next subdomain an odd # of subdomains
for (let i: number = 0; i < 3; i++)
  PAR.subdomains[1].subdomains.push({
    name: "oddData" + i,
    id: PAR.subdomains[1].id + "." + i,
    parentDomain: PAR.subdomains[1],
    subdomains: [],
    description: `odds ${i}`,
  });

// Give the the last subdomain one subdomain
PAR.subdomains[2].subdomains.push({
  name: "soloData",
  id: PAR.subdomains[2].id + ".1",
  parentDomain: PAR.subdomains[2],
  subdomains: [],
  description: "so lonely...",
});

export default PAR;
