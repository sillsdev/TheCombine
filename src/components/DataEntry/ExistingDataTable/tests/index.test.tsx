import renderer from "react-test-renderer";

import ExistingDataTable from "components/DataEntry/ExistingDataTable";
import { newSemanticDomain } from "types/semanticDomain";
import { DomainWord, newWord } from "types/word";

jest.mock("@mui/material/Drawer", () => "div");

jest.mock(
  "components/DataEntry/ExistingDataTable/ImmutableExistingData",
  () => "div",
);

const mockWords = [new DomainWord(newWord()), new DomainWord(newWord())];

describe("ExistingData", () => {
  it("renders side panel version", () => {
    renderer.act(() => {
      renderer.create(
        <ExistingDataTable
          domain={newSemanticDomain()}
          domainWords={mockWords}
          toggleDrawer={jest.fn()}
        />,
      );
    });
  });
  it("renders drawer version", () => {
    renderer.act(() => {
      renderer.create(
        <ExistingDataTable
          domain={newSemanticDomain()}
          domainWords={mockWords}
          drawerOpen
          toggleDrawer={jest.fn()}
          typeDrawer
        />,
      );
    });
  });
});
