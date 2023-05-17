import renderer from "react-test-renderer";

import "tests/reactI18nextMock";

import { Gloss, SemanticDomain, Sense, Word } from "api/models";
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
import { firstGlossText } from "utilities/wordUtilities";
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
jest.mock("components/DataEntry/DataEntryTable/NewEntry/SenseDialog");
jest.mock(
  "components/DataEntry/DataEntryTable/NewEntry/VernDialog",
  () => "div"
);
jest.mock(
  "components/DataEntry/DataEntryTable/RecentEntry/RecentEntry",
  () => "div"
);
jest.mock("components/Pronunciations/PronunciationsComponent", () => "div");
jest.mock("components/Pronunciations/Recorder");

jest.spyOn(window, "alert").mockImplementation(() => {});

let testRenderer: renderer.ReactTestRenderer;
let testHandle: renderer.ReactTestInstance;

const mockWord = (): Word => simpleWord("mockVern", "mockGloss");
const mockMultiWord = multiSenseWord("vern", ["gloss1", "gloss2"]);
const mockTreeNode = newSemanticDomainTreeNode("semDomId");
const mockSemDom = semDomFromTreeNode(mockTreeNode);
const mockUserId = "mockUserId";

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
      <DataEntryTable
        semanticDomain={mockTreeNode}
        openTree={mockOpenTree}
        hideQuestions={mockHideQuestions}
        showExistingData={jest.fn()}
      />
    );
  });
};

describe("DataEntryTable", () => {
  describe("initial render", () => {
    beforeEach(async () => {
      await renderTable();
    });

    it("gets project data and frontier word", () => {
      expect(mockGetProject).toBeCalledTimes(1);
      expect(mockGetFrontierWords).toBeCalledTimes(1);
    });
  });

  describe("exit button", () => {
    beforeEach(async () => {
      await renderTable();
    });

    it("hides questions", async () => {
      expect(mockHideQuestions).not.toBeCalled();
      testHandle = testRenderer.root.findByProps({ id: exitButtonId });
      await renderer.act(async () => await testHandle.props.onClick());
      expect(mockHideQuestions).toBeCalled();
    });

    it("creates word when new entry has vernacular", async () => {
      // Verify that NewEntry is present
      const newEntryItems = testRenderer.root.findAllByType(NewEntry);
      expect(newEntryItems.length).toBe(1);
      // Set the new entry to have useful content
      const newEntry = simpleWord("hasVern", "");
      newEntryItems[0].instance.setState({ newEntry });
      testHandle = testRenderer.root.findByProps({ id: exitButtonId });
      await renderer.act(async () => await testHandle.props.onClick());
      expect(mockCreateWord).toBeCalled();
    });

    it("doesn't create word when new entry has no vernacular", async () => {
      // Verify that NewEntry is present
      const newEntryItems = testRenderer.root.findAllByType(NewEntry);
      expect(newEntryItems.length).toBe(1);
      // Set the new entry to have no useful content
      const newEntry = simpleWord("", "hasGloss");
      newEntryItems[0].instance.setState({ newEntry });
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
    beforeEach(async () => {
      await renderTable();
    });

    it("doesn't update word in backend if sense is a duplicate", async () => {
      testHandle = testRenderer.root.findByType(DataEntryTable);
      mockMultiWord.senses[0].semanticDomains = [
        newSemanticDomain("differentSemDomId"),
        newSemanticDomain(testHandle.props.semanticDomain.id),
      ];

      testHandle = testRenderer.root.findByType(NewEntry);
      await renderer.act(
        async () =>
          await testHandle.props.updateWordWithNewGloss(
            mockMultiWord.id,
            firstGlossText(mockMultiWord.senses[0]),
            []
          )
      );
      expect(mockUpdateWord).not.toBeCalled();
    });

    it("updates word in backend if gloss exists with different semantic domain", async () => {
      mockMultiWord.senses[0].semanticDomains = [
        newSemanticDomain("differentSemDomId"),
        newSemanticDomain("anotherDifferentSemDomId"),
        newSemanticDomain("andAThird"),
      ];
      testHandle = testRenderer.root.findByType(NewEntry);
      await renderer.act(async () => {
        await testHandle.props.updateWordWithNewGloss(
          mockMultiWord.id,
          firstGlossText(mockMultiWord.senses[0]),
          []
        );
      });
      expect(mockUpdateWord).toBeCalledTimes(1);
    });

    it("updates word in backend if gloss doesn't exist", async () => {
      testHandle = testRenderer.root.findByType(NewEntry);
      await renderer.act(
        async () =>
          await testHandle.props.updateWordWithNewGloss(
            mockMultiWord.id,
            "differentGloss",
            []
          )
      );
      expect(mockUpdateWord).toBeCalledTimes(1);
    });
  });
});
