import renderer from "react-test-renderer";

import ImmutableExistingData from "components/DataEntry/ExistingDataTable/ImmutableExistingData";
import { newGloss } from "types/word";

describe("ImmutableExistingData", () => {
  it("render without crashing", () => {
    renderer.act(() => {
      renderer.create(
        <ImmutableExistingData gloss={newGloss()} vernacular={""} />
      );
    });
  });
});
