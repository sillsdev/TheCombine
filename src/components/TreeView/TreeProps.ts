import SemanticDomain from "./SemanticDomain";

export default interface TreeProps {
  currentDomain: SemanticDomain;
  navigate: (domain: SemanticDomain) => void;
}
