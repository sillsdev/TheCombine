import { Provider } from "react-redux";
import { act, create } from "react-test-renderer";
import configureMockStore from "redux-mock-store";

import "tests/reactI18nextMock";

import GlossCell from "goals/ReviewEntries/ReviewEntriesTable/CellComponents/GlossCell";
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

describe("GlossCell", () => {
  it("renders", async () => {
    await act(async () => {
      create(
        <Provider store={mockStore}>
          <GlossCell rowData={mockWord} value={mockWord.senses} />
        </Provider>
      );
    });
  });

  it("renders editable", async () => {
    await act(async () => {
      create(
        <Provider store={mockStore}>
          <GlossCell rowData={mockWord} value={mockWord.senses} editable />
        </Provider>
      );
    });
  });
});
