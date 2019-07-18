import SemanticDomain from "../SemanticDomain";

// Parent
const PAR: SemanticDomain = {
  name: "parent",
  id: "1",
  subDomains: []
};

// Following subdomains
for (let i: number = 0; i < 3; i++)
  PAR.subDomains[i] = {
    name: "kid",
    id: "1." + i,
    parentDomain: PAR,
    subDomains: []
  };

// Give subdomain 0 an even # of subdomains
for (let i: number = 0; i < 4; i++)
  PAR.subDomains[0].subDomains.push({
    name: "evenData",
    id: PAR.subDomains[0].id + "." + i,
    parentDomain: PAR.subDomains[0],
    subDomains: []
  });

// Give the the next subdomain an odd # of subdomains
for (let i: number = 0; i < 3; i++)
  PAR.subDomains[1].subDomains.push({
    name: "oddData",
    id: PAR.subDomains[1].id + "." + i,
    parentDomain: PAR.subDomains[1],
    subDomains: []
  });

// Give the the last subdomain one subdomain
PAR.subDomains[2].subDomains.push({
  name: "oddData",
  id: PAR.subDomains[2].id + ".1",
  parentDomain: PAR.subDomains[2],
  subDomains: []
});

export default PAR;
