import { act, create } from "react-test-renderer";

import ImmutableExistingData from "components/DataEntry/ExistingDataTable/ImmutableExistingData";
import { newGloss } from "types/word";

describe("ImmutableExistingData", () => {
  it("renders", async () => {
    await act(async () => {
      create(
        <ImmutableExistingData
          glosses={[newGloss()]}
          index={0}
          vernacular={""}
        />
      );
    });
  });
});
