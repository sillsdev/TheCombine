import { Provider } from "react-redux";
import renderer from "react-test-renderer";
import configureMockStore from "redux-mock-store";

import { defaultState } from "components/App/DefaultState";
import NewEntry from "components/DataEntry/DataEntryTable/NewEntry/NewEntry";
import { newSemanticDomain } from "types/word";

jest.mock("components/Pronunciations/Recorder");

const createMockStore = configureMockStore();
const mockStore = createMockStore(defaultState);

describe("NewEntry", () => {
  it("renders without crashing", () => {
    renderer.act(() => {
      renderer.create(
        <Provider store={mockStore}>
          <NewEntry
            allVerns={[]}
            allWords={[]}
            defunctWordIds={[]}
            updateWordWithNewGloss={jest.fn()}
            addNewWord={jest.fn()}
            semanticDomain={newSemanticDomain()}
            setIsReadyState={jest.fn()}
            analysisLang={""}
          />
        </Provider>
      );
    });
  });
});
