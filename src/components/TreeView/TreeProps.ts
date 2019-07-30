import SemanticDomainWithSubdomains from "./SemanticDomain";

export default interface TreeProps {
  currentDomain: SemanticDomainWithSubdomains;
  navigate: (domain: SemanticDomainWithSubdomains) => void;
}
