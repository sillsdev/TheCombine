import { TableSortLabel } from "@mui/material";
import { MRT_TableBodyRow, MRT_TableHeadCell } from "material-react-table";
import { Provider } from "react-redux";
import { type ReactTestRenderer, act, create } from "react-test-renderer";
import configureMockStore from "redux-mock-store";

import { defaultState } from "components/Project/ProjectReduxTypes";
import ReviewEntriesTable, {
  ColumnId,
} from "goals/ReviewEntries/ReviewEntriesTable";
import VernacularCell from "goals/ReviewEntries/ReviewEntriesTable/Cells/VernacularCell";
import {
  mockWords,
  sortOrder,
} from "goals/ReviewEntries/ReviewEntriesTable/tests/WordsMock";
import { type StoreState } from "rootRedux/types";

// With `columnFilterDisplayMode: "popover",`, it is necessary to mock out `Grow`.
// To access filter `TextField`s, replace both `Grow`, `Modal` with `div`.
// However, using a `TextField`'s `.props.onChange()` doesn't activate a filter.
jest.mock("@mui/material/Grow", () => "div");

// Intercept i18n to set the resolvedLanguage for localization testing.
jest.mock("react-i18next", () => ({
  ...jest.requireActual("react-i18next"),
  useTranslation: () => mockUseTranslation(),
}));
const mockUseTranslation = jest.fn();
const setMockUseTranslation = (resolvedLanguage: string): void => {
  mockUseTranslation.mockReturnValue({
    i18n: { resolvedLanguage },
    t: (str: string) => str,
  });
};

jest.mock("backend", () => ({
  getAllSpeakers: (projectId: string) => mockGetAllSpeakers(projectId),
  getFrontierWords: (...args: any[]) => mockGetFrontierWords(...args),
  getWord: (wordId: string) => mockGetWord(wordId),
}));
jest.mock("components/Pronunciations/PronunciationsBackend");
jest.mock("i18n", () => ({}));

const mockClickEvent = { stopPropagation: jest.fn() };
const mockGetAllSpeakers = jest.fn();
const mockGetFrontierWords = jest.fn();
const mockGetWord = jest.fn();
const mockState = (
  definitionsEnabled = false,
  grammaticalInfoEnabled = false
): Partial<StoreState> => ({
  currentProjectState: {
    ...defaultState,
    project: {
      ...defaultState.project,
      definitionsEnabled,
      grammaticalInfoEnabled,
    },
  },
});

let renderer: ReactTestRenderer;

const renderReviewEntriesTable = async (
  definitionsEnabled = false,
  grammaticalInfoEnabled = false,
  i18nLang = ""
): Promise<void> => {
  setMockUseTranslation(i18nLang);
  const mockStore = configureMockStore()(
    mockState(definitionsEnabled, grammaticalInfoEnabled)
  );
  await act(async () => {
    renderer = create(
      <Provider store={mockStore}>
        <ReviewEntriesTable disableVirtualization />
      </Provider>
    );
  });
};

function setMockFunctions(): void {
  jest.clearAllMocks();
  mockGetAllSpeakers.mockResolvedValue([]);
  mockGetFrontierWords.mockResolvedValue(mockWords());
}

beforeEach(() => {
  setMockFunctions();
});

describe("ReviewEntriesTable", () => {
  test("initial render fetches frontier and loads data", async () => {
    await renderReviewEntriesTable();
    expect(mockGetFrontierWords).toHaveBeenCalled();
    expect(renderer.root.findAllByType(MRT_TableBodyRow)).toHaveLength(4);
  });

  describe("table sort", () => {
    beforeEach(async () => {
      await renderReviewEntriesTable(true, true);
    });

    /** Checks if the WordsMock.tsx words have been sorted by the given column. */
    const checkRowOrder = (col: number, dir: "asc" | "desc"): void => {
      const rowIds = renderer.root
        .findAllByType(VernacularCell)
        .map((cell) => cell.props.word.id);
      const order = [...sortOrder[col]];
      if (dir === "desc") {
        order.reverse();
      }
      order.forEach((id, index) => {
        expect(rowIds[index]).toEqual(`${id}`);
      });
    };

    /** The accessor columns in default order. */
    const cols = [
      "Vernacular",
      "Senses",
      "Definitions",
      "Glosses",
      "PartOfSpeech",
      "Domains",
      "Pronunciations",
      "Note",
      "Flag",
    ];

    cols.forEach((col, i) => {
      test(`sorting by ${col} column`, async () => {
        const button = renderer.root.findAllByType(TableSortLabel)[i];
        expect(button.props.direction).toBeUndefined();
        await act(async () => {
          button.props.onClick(mockClickEvent);
        });
        expect(button.props.direction).toEqual("asc");
        checkRowOrder(i, "asc");
        await act(async () => {
          button.props.onClick(mockClickEvent);
        });
        expect(button.props.direction).toEqual("desc");
        checkRowOrder(i, "desc");
        await act(async () => {
          button.props.onClick(mockClickEvent);
        });
        expect(button.props.direction).toBeUndefined();
      });
    });
  });

  describe("definitionsEnabled & grammaticalInfoEnabled", () => {
    test("show definitions when definitionsEnabled is true", async () => {
      await renderReviewEntriesTable(true, false);
      const colIds = renderer.root
        .findAllByType(MRT_TableHeadCell)
        .map((col) => col.props.header.id);
      expect(colIds).toContain(ColumnId.Definitions);
      expect(colIds).not.toContain(ColumnId.PartOfSpeech);
    });

    test("show part of speech when grammaticalInfoEnabled is true", async () => {
      await renderReviewEntriesTable(false, true);
      const colIds = renderer.root
        .findAllByType(MRT_TableHeadCell)
        .map((col) => col.props.header.id);
      expect(colIds).not.toContain(ColumnId.Definitions);
      expect(colIds).toContain(ColumnId.PartOfSpeech);
    });
  });

  describe("localization", () => {
    /** A hover-text phrase from MRT's localization. */
    const localizedText = {
      ar: "إظهار / إخفاء الأعمدة",
      en: "Show/Hide columns",
      es: "Mostrar/ocultar columnas",
      fr: "Afficher/Masquer les colonnes",
      pt: "Mostrar/Ocultar colunas",
      zh: "显示/隐藏 列",
    };

    test("defaults to en", async () => {
      await renderReviewEntriesTable();
      // Throws error if no component found with specified `title` prop
      renderer.root.findByProps({ title: localizedText["en"] });
    });

    Object.entries(localizedText).forEach(([lang, text]) => {
      test(lang, async () => {
        await renderReviewEntriesTable(false, false, lang);
        // Throws error if no component found with specified `title` prop
        renderer.root.findByProps({ title: text });
      });
    });
  });
});
