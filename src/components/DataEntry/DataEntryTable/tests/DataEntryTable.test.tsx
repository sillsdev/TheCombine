import renderer, {
  ReactTestInstance,
  ReactTestRenderer,
} from "react-test-renderer";

import "tests/mockReactI18next";

import { Sense, Word } from "api/models";
import DataEntryTable, {
  addSemanticDomainToSense,
  addSenseToWord,
  exitButtonId,
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
  useSnackbar: () => {
    return { enqueueSnackbar: mockEnqueue };
  },
}));

jest.mock("backend", () => ({
  createWord: (word: Word) => mockCreateWord(word),
  getDuplicateId: jest.fn(),
  getProject: (id: string) => mockGetProject(id),
  getWord: (id: string) => mockGetWord(id),
  updateWord: (word: Word) => mockUpdateWord(word),
  getFrontierWords: () => mockGetFrontierWords(),
}));
jest.mock(
  "components/DataEntry/DataEntryTable/RecentEntry/RecentEntry",
  () => "div"
);
jest.mock("components/Pronunciations/PronunciationsComponent", () => "div");
jest.mock("components/Pronunciations/Recorder");

jest.spyOn(window, "alert").mockImplementation(() => {});

let testRenderer: ReactTestRenderer;
let testHandle: ReactTestInstance;

const mockWord = () => simpleWord("mockVern", "mockGloss");
const mockMultiWord = multiSenseWord("vern", ["gloss1", "gloss2"]);
const mockTreeNode = newSemanticDomainTreeNode();
const mockSemanticDomain = semDomFromTreeNode(mockTreeNode);
const mockOpenTree = jest.fn();
const mockGetFrontierWords = jest.fn();

const mockCreateWord = jest.fn();
const mockGetProject = jest.fn();
const mockGetWord = jest.fn();
const mockHideQuestions = jest.fn();
const mockUpdateWord = jest.fn();
const mockEnqueue = jest.fn();
function setMocks() {
  mockCreateWord.mockResolvedValue(mockWord());
  mockGetProject.mockResolvedValue(newProject());
  mockGetWord.mockResolvedValue([mockMultiWord]);
  mockUpdateWord.mockResolvedValue(mockWord());
  mockGetFrontierWords.mockResolvedValue([mockMultiWord]);
}

beforeEach(async () => {
  jest.clearAllMocks();
  setMocks();
  await renderer.act(async () => {
    testRenderer = await renderer.create(
      <DataEntryTable
        semanticDomain={mockTreeNode}
        openTree={mockOpenTree}
        hideQuestions={mockHideQuestions}
        showExistingData={jest.fn()}
      />
    );
  });
});

describe("DataEntryTable", () => {
  describe("exit button", () => {
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

  describe("addSenseToWord", () => {
    it("adds a sense to a word that has no senses", () => {
      const word = mockWord();
      word.senses = [];
      const gloss = "firstSense";
      const language = Bcp47Code.Es;

      const expectedSense = newSense(gloss, language, mockSemanticDomain);
      expectedSense.guid = expect.any(String);
      expectedSense.semanticDomains[0].created = expect.any(String);
      expectedSense.semanticDomains[0].userId = undefined;
      const expectedWord: Word = { ...word, senses: [expectedSense] };

      const resultWord = addSenseToWord(
        mockSemanticDomain,
        word,
        gloss,
        language
      );
      expect(resultWord).toEqual(expectedWord);
    });

    it("adds a sense to a word that already has a sense", () => {
      const word = mockWord();
      const gloss = "newSense";
      const language = Bcp47Code.Es;

      const expectedSense = newSense(gloss, language, mockSemanticDomain);
      expectedSense.guid = expect.any(String);
      expectedSense.semanticDomains[0].created = expect.any(String);
      expectedSense.semanticDomains[0].userId = undefined;
      const expectedWord: Word = {
        ...word,
        senses: [...word.senses, expectedSense],
      };

      const resultWord = addSenseToWord(
        mockSemanticDomain,
        word,
        gloss,
        language
      );
      expect(resultWord).toEqual(expectedWord);
    });
  });

  describe("addSemanticDomainToSense", () => {
    it("adds a semantic domain to existing sense", () => {
      const word = mockWord();
      const gloss = "senseToBeModified";
      const language = Bcp47Code.Fr;
      const sense = newSense(gloss, language);
      word.senses = [sense];

      const expectedSense: Sense = {
        ...sense,
        semanticDomains: [mockSemanticDomain],
      };
      const expectedWord: Word = { ...word, senses: [expectedSense] };

      const resultWord = addSemanticDomainToSense(mockSemanticDomain, word, 0);
      expect(resultWord).toEqual(expectedWord);
    });
  });

  describe("updateWordWithNewGloss", () => {
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
      // Assert that the backend function for updating the word was NOT called
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
      // Assert that the backend function for updating the word was called once
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
      // Assert that the backend function for updating the word was called once
      expect(mockUpdateWord).toBeCalledTimes(1);
    });
  });
});
