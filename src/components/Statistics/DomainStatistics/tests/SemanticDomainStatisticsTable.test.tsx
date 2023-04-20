import renderer from "react-test-renderer";

import SemanticDomainStatisticsTable from "components/Statistics/DomainStatistics/SemanticDomainStatisticsTable";
import { newSemanticDomainTreeNode } from "types/semanticDomain";

const mockTreeNode = newSemanticDomainTreeNode();

describe("SemanticDomainStatisticsTable", () => {
  it("render without crashing", () => {
    renderer.act(() => {
      renderer.create(
        <SemanticDomainStatisticsTable domain={mockTreeNode} count={0} />
      );
    });
  });
});
