import { Provider } from "react-redux";
import renderer from "react-test-renderer";
import configureMockStore from "redux-mock-store";

import "tests/mockReactI18next";

import { Gloss, SemanticDomain, Sense, Word } from "api/models";
import { defaultState } from "components/App/DefaultState";
import DataEntryTable, {
  WordAccess,
  addSemanticDomainToSense,
  exitButtonId,
  makeSemDomCurrent,
  updateEntryGloss,
} from "components/DataEntry/DataEntryTable/DataEntryTable";
import NewEntry from "components/DataEntry/DataEntryTable/NewEntry/NewEntry";
import { newProject } from "types/project";
import {
  newSemanticDomain,
  newSemanticDomainTreeNode,
  semDomFromTreeNode,
} from "types/semanticDomain";
import { multiSenseWord, newSense, simpleWord } from "types/word";
import { firstGlossText } from "types/wordUtilities";
import { Bcp47Code } from "types/writingSystem";

jest.mock("@mui/material/Autocomplete", () => "div");
jest.mock("notistack", () => ({
  ...jest.requireActual("notistack"),
  useSnackbar: () => ({ enqueueSnackbar: jest.fn() }),
}));

jest.mock("backend", () => ({
  createWord: (word: Word) => mockCreateWord(word),
  getDuplicateId: jest.fn(),
  getFrontierWords: () => mockGetFrontierWords(),
  getProject: (id: string) => mockGetProject(id),
  getWord: (id: string) => mockGetWord(id),
  updateWord: (word: Word) => mockUpdateWord(word),
}));
jest.mock("backend/localStorage", () => ({
  getUserId: () => mockUserId,
}));
jest.mock(
  "components/DataEntry/DataEntryTable/RecentEntry/RecentEntry",
  () => "div"
);
jest.mock("components/Pronunciations/PronunciationsComponent", () => "div");
jest.mock("components/Pronunciations/Recorder");
jest.mock("utilities");

jest.spyOn(window, "alert").mockImplementation(() => {});

let testRenderer: renderer.ReactTestRenderer;
let testHandle: renderer.ReactTestInstance;

const mockWord = (): Word => simpleWord("mockVern", "mockGloss");
const mockMultiWord = multiSenseWord("vern", ["gloss1", "gloss2"]);
const mockSemDomId = "semDomId";
const mockTreeNode = newSemanticDomainTreeNode(mockSemDomId);
const mockSemDom = semDomFromTreeNode(mockTreeNode);
const mockUserId = "mockUserId";
const mockStore = configureMockStore()(defaultState);

const mockCreateWord = jest.fn();
const mockGetFrontierWords = jest.fn();
const mockGetProject = jest.fn();
const mockGetWord = jest.fn();
const mockHideQuestions = jest.fn();
const mockOpenTree = jest.fn();
const mockUpdateWord = jest.fn();

function setMocks(): void {
  mockCreateWord.mockResolvedValue(mockWord());
  mockGetFrontierWords.mockResolvedValue([mockMultiWord]);
  mockGetProject.mockResolvedValue(newProject());
  mockGetWord.mockResolvedValue(mockMultiWord);
  mockUpdateWord.mockResolvedValue(mockWord());
}

beforeEach(() => {
  jest.clearAllMocks();
  setMocks();
});

const renderTable = async (): Promise<void> => {
  await renderer.act(async () => {
    testRenderer = renderer.create(
      <Provider store={mockStore}>
        <DataEntryTable
          semanticDomain={mockTreeNode}
          openTree={mockOpenTree}
          hideQuestions={mockHideQuestions}
          showExistingData={jest.fn()}
        />
      </Provider>
    );
  });
};

describe("DataEntryTable", () => {
  describe("initial render", () => {
    beforeEach(async () => await renderTable());

    it("gets frontier word", () => {
      expect(mockGetFrontierWords).toBeCalledTimes(1);
    });
  });

  describe("exit button", () => {
    beforeEach(async () => await renderTable());

    it("hides questions", async () => {
      expect(mockHideQuestions).not.toBeCalled();
      testHandle = testRenderer.root.findByProps({ id: exitButtonId });
      await renderer.act(async () => await testHandle.props.onClick());
      expect(mockHideQuestions).toBeCalled();
    });

    it("creates word when new entry has vernacular", async () => {
      expect(mockCreateWord).not.toBeCalled();
      testHandle = testRenderer.root.findByType(NewEntry);
      expect(testHandle).not.toBeNull;
      // Set newVern but not newGloss.
      await renderer.act(async () => testHandle.props.setNewVern("hasVern"));
      testHandle = testRenderer.root.findByProps({ id: exitButtonId });
      await renderer.act(async () => await testHandle.props.onClick());
      expect(mockCreateWord).toBeCalledTimes(1);
    });

    it("doesn't create word when new entry has no vernacular", async () => {
      testHandle = testRenderer.root.findByType(NewEntry);
      expect(testHandle).not.toBeNull;
      // Set newGloss but not newVern.
      await renderer.act(async () => testHandle.props.setNewGloss("hasGloss"));
      testHandle = testRenderer.root.findByProps({ id: exitButtonId });
      await renderer.act(async () => await testHandle.props.onClick());
      expect(mockCreateWord).not.toBeCalled();
    });

    it("opens the domain tree", async () => {
      expect(mockOpenTree).not.toBeCalled();
      testHandle = testRenderer.root.findByProps({ id: exitButtonId });
      await renderer.act(async () => await testHandle.props.onClick());
      expect(mockOpenTree).toBeCalledTimes(1);
    });
  });

  describe("addSemanticDomainToSense", () => {
    it("adds a semantic domain to existing sense", () => {
      const word = mockWord();
      const gloss = "senseToBeModified";
      const language = Bcp47Code.Fr;
      const sense = newSense(gloss, language);
      word.senses = [sense];

      const semDom = makeSemDomCurrent(mockSemDom);
      semDom.created = expect.any(String);
      const expectedSense: Sense = { ...sense, semanticDomains: [semDom] };
      const expectedWord: Word = { ...word, senses: [expectedSense] };

      const resultWord = addSemanticDomainToSense(mockSemDom, word, sense.guid);
      expect(resultWord).toEqual(expectedWord);
    });
  });

  describe("makeSemDomCurrent", () => {
    it("adds timestamp and the current user", () => {
      expect(mockSemDom.created).toBeUndefined;
      expect(mockSemDom.userId).toBeUndefined;

      const currentDom = makeSemDomCurrent(mockSemDom);
      expect(currentDom.created).not.toBeUndefined();
      expect(currentDom.userId).toEqual(mockUserId);
    });
  });

  describe("updateEntryGloss", () => {
    it("directly updates a sense with no other semantic domains", () => {
      const senseIndex = 1;
      const sense = mockMultiWord.senses[senseIndex];
      sense.semanticDomains = [mockSemDom];
      const entry: WordAccess = { word: mockMultiWord, senseGuid: sense.guid };
      const def = "newGlossDef";

      const expectedGloss: Gloss = { ...sense.glosses[0], def };
      const expectedWord: Word = { ...entry.word };
      expectedWord.senses[senseIndex] = { ...sense, glosses: [expectedGloss] };

      expect(updateEntryGloss(entry, def, mockSemDom.id)).toEqual(expectedWord);
    });

    it("splits a sense with multiple semantic domains", () => {
      const word = mockWord();
      const sense = word.senses[0];
      const otherDomain: SemanticDomain = { ...mockSemDom, id: "otherId" };
      sense.semanticDomains = [otherDomain, mockSemDom];
      const entry: WordAccess = { word, senseGuid: sense.guid };
      const def = "newGlossDef";

      const oldSense: Sense = { ...sense, semanticDomains: [otherDomain] };
      const newSense: Sense = { ...sense };
      newSense.glosses = [{ ...sense.glosses[0], def }];
      newSense.guid = expect.any(String);
      newSense.semanticDomains = [mockSemDom];
      const expectedWord: Word = { ...word, senses: [oldSense, newSense] };

      expect(updateEntryGloss(entry, def, mockSemDom.id)).toEqual(expectedWord);
    });
  });

  describe("updateWordWithNewGloss", () => {
    const changeSemDoms = (
      word: Word,
      semanticDomains: SemanticDomain[]
    ): Word => {
      const senses = [...word.senses];
      senses[0] = { ...senses[0], semanticDomains };
      return { ...word, senses };
    };

    it("doesn't update word in backend if sense is a duplicate", async () => {
      const word = changeSemDoms(mockMultiWord, [
        newSemanticDomain("someSemDomId"),
        newSemanticDomain(mockSemDomId),
      ]);
      mockGetFrontierWords.mockResolvedValue([word]);
      await renderTable();
      testHandle = testRenderer.root.findByType(NewEntry);
      await renderer.act(async () => {
        await testHandle.props.setNewGloss(firstGlossText(word.senses[0]));
        await testHandle.props.updateWordWithNewGloss(word.id);
      });
      expect(mockUpdateWord).not.toBeCalled();
    });

    it("updates word in backend if gloss exists with different semantic domain", async () => {
      const word = changeSemDoms(mockMultiWord, [
        newSemanticDomain("someSemDomId"),
        newSemanticDomain("anotherSemDomId"),
        newSemanticDomain("andAThird"),
      ]);
      mockGetFrontierWords.mockResolvedValue([word]);
      await renderTable();
      testHandle = testRenderer.root.findByType(NewEntry);
      await renderer.act(async () => {
        await testHandle.props.setNewGloss(firstGlossText(word.senses[0]));
        await testHandle.props.updateWordWithNewGloss(word.id);
      });
      expect(mockUpdateWord).toBeCalledTimes(1);
    });

    it("updates word in backend if gloss doesn't exist", async () => {
      await renderTable();
      testHandle = testRenderer.root.findByType(NewEntry);
      await renderer.act(async () => {
        await testHandle.props.setNewGloss("differentGloss");
        await testHandle.props.updateWordWithNewGloss(mockMultiWord.id);
      });
      expect(mockUpdateWord).toBeCalledTimes(1);
    });
  });
});
