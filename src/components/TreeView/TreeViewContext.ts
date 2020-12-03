import React from "react";
import SemanticDomainWithSubdomains from "../../types/SemanticDomain";

export const TreeContext = React.createContext({
  idToDomainMap: new Map<string, SemanticDomainWithSubdomains>(),
});
