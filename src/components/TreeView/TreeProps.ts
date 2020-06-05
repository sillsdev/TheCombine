import SemanticDomainWithSubdomains from "./SemanticDomain";

export default interface TreeProps {
  currentDomain: SemanticDomainWithSubdomains;
  navigateTree: (domain: SemanticDomainWithSubdomains) => void;
}
