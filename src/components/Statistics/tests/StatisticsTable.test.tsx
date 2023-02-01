import renderer from "react-test-renderer";

import StatisticsTable from "components/Statistics/StatisticsTable";
import { newSemanticDomainTreeNode } from "types/semanticDomain";

const mockTreeNode = newSemanticDomainTreeNode();

describe("StatisticsTable", () => {
  it("render without crashing", () => {
    renderer.act(() => {
      renderer.create(<StatisticsTable domain={mockTreeNode} count={0} />);
    });
  });
});
