import renderer from "react-test-renderer";

import { ImmutableExistingData } from "components/DataEntry/ExistingDataTable/ImmutableExistingData";

describe("ImmutableExistingData", () => {
  it("render without crashing", () => {
    renderer.act(() => {
      renderer.create(<ImmutableExistingData vernacular={""} gloss={""} />);
    });
  });
});
