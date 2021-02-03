import SemanticDomainWithSubdomains from "types/SemanticDomain";

export default interface TreeProps {
  currentDomain: SemanticDomainWithSubdomains;
  navigateTree: (domain: SemanticDomainWithSubdomains) => void;
}
