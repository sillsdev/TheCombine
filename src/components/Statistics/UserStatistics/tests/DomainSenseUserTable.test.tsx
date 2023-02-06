import renderer from "react-test-renderer";

import DomainSenseUserTable from "components/Statistics/UserStatistics/DomainSenseUserTable";
import { newDomainSenseUserCount } from "types/semanticDomain";

const mockDomainSenseUserCount = newDomainSenseUserCount();

describe("DomainSenseUserTable", () => {
  it("render without crashing", () => {
    renderer.act(() => {
      renderer.create(
        <DomainSenseUserTable domainSenseUserCount={mockDomainSenseUserCount} />
      );
    });
  });
});
