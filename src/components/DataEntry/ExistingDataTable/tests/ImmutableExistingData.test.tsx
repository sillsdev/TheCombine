import { act, render } from "@testing-library/react";

import ImmutableExistingData from "components/DataEntry/ExistingDataTable/ImmutableExistingData";
import { newGloss } from "types/word";

describe("ImmutableExistingData", () => {
  it("renders", async () => {
    await act(async () => {
      render(
        <ImmutableExistingData
          glosses={[newGloss()]}
          index={0}
          vernacular={""}
        />
      );
    });
  });
});
