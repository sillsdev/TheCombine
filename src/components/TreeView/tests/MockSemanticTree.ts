import SemanticDomain from "../SemanticDomain";

// Parent
const PAR: SemanticDomain = {
  name: "parent",
  number: "1",
  subDomains: []
};

// Following subdomains
for (let i: number = 0; i < 3; i++)
  PAR.subDomains.push({
    name: "kid" + i,
    number: "1." + i,
    parentDomain: PAR,
    subDomains: []
  });

// Give subdomain 0 an even # of subdomains
for (let i: number = 0; i < 4; i++)
  PAR.subDomains[0].subDomains.push({
    name: "evenData" + i,
    number: PAR.subDomains[0].number + "." + i,
    parentDomain: PAR.subDomains[0],
    subDomains: []
  });

// Give the the next subdomain an odd # of subdomains
for (let i: number = 0; i < 3; i++)
  PAR.subDomains[1].subDomains.push({
    name: "oddData" + i,
    number: PAR.subDomains[1].number + "." + i,
    parentDomain: PAR.subDomains[1],
    subDomains: []
  });

// Give the the last subdomain one subdomain
PAR.subDomains[2].subDomains.push({
  name: "soloData",
  number: PAR.subDomains[2].number + ".1",
  parentDomain: PAR.subDomains[2],
  subDomains: []
});

export default PAR;
