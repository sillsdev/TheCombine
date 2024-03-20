import { Provider } from "react-redux";
import { act, create } from "react-test-renderer";
import configureMockStore from "redux-mock-store";

import DefinitionCell from "goals/ReviewEntries/ReviewEntriesTable/CellComponents/DefinitionCell";
import mockWords from "goals/ReviewEntries/tests/WordsMock";
import { defaultWritingSystem } from "types/writingSystem";

// The multiline Input, TextField cause problems in the mock environment.
jest.mock("@mui/material/Input", () => "div");
jest.mock("@mui/material/TextField", () => "div");

const mockStore = configureMockStore()({
  currentProjectState: {
    project: { analysisWritingSystems: [defaultWritingSystem] },
  },
});
const mockWord = mockWords()[0];

describe("DefinitionCell", () => {
  it("renders", async () => {
    await act(async () => {
      create(
        <Provider store={mockStore}>
          <DefinitionCell rowData={mockWord} value={mockWord.senses} />
        </Provider>
      );
    });
  });

  it("renders editable", async () => {
    await act(async () => {
      create(
        <Provider store={mockStore}>
          <DefinitionCell rowData={mockWord} value={mockWord.senses} editable />
        </Provider>
      );
    });
  });
});
