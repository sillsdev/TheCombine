import renderer from "react-test-renderer";

import DomainUserTable from "components/Statistics/UserStatistics/DomainUserTable";
import { newSemanticDomainUserCount } from "types/semanticDomain";

const mockSemanticDomainUserCount = newSemanticDomainUserCount();

describe("DomainSenseUserTable", () => {
  it("render without crashing", () => {
    renderer.act(() => {
      renderer.create(
        <DomainUserTable
          semanticDomainUserCount={mockSemanticDomainUserCount}
        />
      );
    });
  });
});
