import { act, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import configureMockStore from "redux-mock-store";

import { defaultState } from "components/Project/ProjectReduxTypes";
import ReviewEntriesTable from "goals/ReviewEntries/ReviewEntriesTable";
import {
  mockWords,
  sortOrder,
  verns,
} from "goals/ReviewEntries/ReviewEntriesTable/tests/WordsMock";
import { type StoreState } from "rootRedux/types";

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
  getAllSpeakers: () => Promise.resolve([]),
  getFrontierWords: (...args: any[]) => mockGetFrontierWords(...args),
  getWord: (wordId: string) => mockGetWord(wordId),
}));
jest.mock("components/Pronunciations/PronunciationsBackend");
jest.mock("i18n", () => ({}));

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
    render(
      <Provider store={mockStore}>
        <ReviewEntriesTable disableVirtualization />
      </Provider>
    );
  });
};

function setMockFunctions(): void {
  jest.clearAllMocks();
  mockGetFrontierWords.mockResolvedValue(mockWords());
}

beforeEach(() => {
  setMockFunctions();
});

describe("ReviewEntriesTable", () => {
  test("initial render fetches frontier and loads data", async () => {
    await renderReviewEntriesTable();
    expect(mockGetFrontierWords).toHaveBeenCalled();
    const rowCount = mockWords().length + 1; // +1 for header row
    expect(screen.getAllByRole("row")).toHaveLength(rowCount);
  });

  describe("table sort", () => {
    beforeEach(async () => {
      await renderReviewEntriesTable(true, true);
    });

    /** Checks if the WordsMock.tsx words have been sorted by the given column. */
    const checkRowOrder = (col: number, dir: "asc" | "desc"): void => {
      // Use distinct mock verns to determine sorted order.
      const sorted = screen
        .getAllByRole("row")
        .slice(1)
        .map((r) => verns.findIndex((v) => within(r).queryByText(v)));

      // Verify the order is right.
      const order = [...sortOrder[col]];
      if (dir === "desc") {
        order.reverse();
      }
      expect(sorted).toEqual(order);
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
        // The icon changes when clicked, so use the surrounding span.
        const button = screen.getAllByTestId("SyncAltIcon")[i].closest("span");

        await userEvent.click(button!);
        checkRowOrder(i, "asc");

        await userEvent.click(button!);
        checkRowOrder(i, "desc");
      });
    });
  });

  describe("definitionsEnabled & grammaticalInfoEnabled", () => {
    const defTextId = "reviewEntries.columns.definitions";
    const posTextId = "reviewEntries.columns.partOfSpeech";

    test("show definitions when definitionsEnabled is true", async () => {
      await renderReviewEntriesTable(true, false);
      expect(screen.queryByText(defTextId)).toBeTruthy();
      expect(screen.queryByText(posTextId)).toBeNull();
    });

    test("show part of speech when grammaticalInfoEnabled is true", async () => {
      await renderReviewEntriesTable(false, true);
      expect(screen.queryByText(defTextId)).toBeNull();
      expect(screen.queryByText(posTextId)).toBeTruthy();
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
      screen.getByLabelText(localizedText["en"]); // throws if none
    });

    Object.entries(localizedText).forEach(([lang, text]) => {
      test(lang, async () => {
        await renderReviewEntriesTable(false, false, lang);
        screen.getByLabelText(text); // throws if none
      });
    });
  });
});
