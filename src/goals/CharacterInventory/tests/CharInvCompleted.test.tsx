import { act, render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import configureMockStore from "redux-mock-store";

import CharInvCompleted, {
  CharInvChangesGoalList,
  CharInvCompletedTextId,
} from "goals/CharacterInventory/CharInvCompleted";
import {
  type CharInvChanges,
  type CharacterChange,
  CharacterStatus,
  type FindAndReplaceChange,
  defaultCharInvChanges,
} from "goals/CharacterInventory/CharacterInventoryTypes";
import { defaultState } from "goals/Redux/GoalReduxTypes";
import { type StoreState } from "rootRedux/types";
import { newWord as mockWord } from "types/word";

jest.mock("backend", () => ({
  areInFrontier: (ids: string[]) => Promise.resolve(ids),
  getWord: () => Promise.resolve(mockWord()),
  updateWord: jest.fn(),
}));
jest.mock("i18n", () => ({})); // else `thrown: "Error: AggregateError`

const mockCharChanges: CharacterChange[] = [
  ["a", CharacterStatus.Accepted, CharacterStatus.Rejected],
  ["b", CharacterStatus.Accepted, CharacterStatus.Undecided],
  ["c", CharacterStatus.Rejected, CharacterStatus.Accepted],
  ["d", CharacterStatus.Rejected, CharacterStatus.Undecided],
  ["e", CharacterStatus.Undecided, CharacterStatus.Accepted],
  ["f", CharacterStatus.Undecided, CharacterStatus.Rejected],
];
const mockWordKeys = ["oldA", "oldB"];
const mockWordChanges: FindAndReplaceChange = {
  find: "Q",
  replace: "q",
  words: { [mockWordKeys[0]]: "newA", [mockWordKeys[1]]: "newB" },
};
const mockState = (changes?: CharInvChanges): Partial<StoreState> => ({
  goalsState: {
    ...defaultState,
    currentGoal: { ...defaultState.currentGoal, changes },
  },
});

beforeEach(() => {
  jest.resetAllMocks();
});

describe("CharInvCompleted", () => {
  const renderCharInvCompleted = async (
    changes?: Partial<CharInvChanges>
  ): Promise<void> => {
    const charInvChanges = { ...defaultCharInvChanges, ...changes };
    await act(async () => {
      render(
        <Provider store={configureMockStore()(mockState(charInvChanges))}>
          <CharInvCompleted />
        </Provider>
      );
    });
  };

  it("renders char changes", async () => {
    await renderCharInvCompleted({ charChanges: mockCharChanges });

    // One listitem per char-change.
    expect(screen.getAllByRole("listitem")).toHaveLength(
      mockCharChanges.length
    );
    expect(
      screen.queryByText(CharInvCompletedTextId.CharChangesNone)
    ).toBeNull();

    // No word-changes.
    expect(
      screen.queryAllByText(CharInvCompletedTextId.WordChangesWithString)
    ).toHaveLength(0);
    expect(
      screen.queryByText(CharInvCompletedTextId.WordChangesNone)
    ).toBeTruthy();
  });

  it("renders word changes", async () => {
    await renderCharInvCompleted({ wordChanges: [mockWordChanges] });

    // One listitem for the no-char-change text.
    expect(screen.getAllByRole("listitem")).toHaveLength(1);
    expect(
      screen.queryByText(CharInvCompletedTextId.CharChangesNone)
    ).toBeTruthy();

    // One word-changes.
    expect(
      screen.queryAllByText(CharInvCompletedTextId.WordChangesWithString)
    ).toHaveLength(1);
    expect(
      screen.queryByText(CharInvCompletedTextId.WordChangesNone)
    ).toBeNull();
  });
});

describe("CharInvChangesGoalList", () => {
  const changeLimit = 3;

  const renderCharInvChangesGoalList = async (
    changes?: Partial<CharInvChanges>
  ): Promise<void> => {
    await act(async () => {
      render(CharInvChangesGoalList({ ...defaultCharInvChanges, ...changes }));
    });
  };

  describe(`shows up to ${changeLimit} char changes`, () => {
    for (let i = 0; i <= changeLimit; i++) {
      test(`shows ${i} char changes`, async () => {
        const charChanges = mockCharChanges.slice(0, i);
        await renderCharInvChangesGoalList({ charChanges });
        expect(screen.queryAllByRole("listitem")).toHaveLength(i);
        const noChanges = screen.queryByText(
          CharInvCompletedTextId.CharChangesNone
        );
        if (i) {
          expect(noChanges).toBeNull();
        } else {
          expect(noChanges).toBeTruthy();
        }
      });
    }
  });

  it(`shows only ${changeLimit} items when there are more char changes than that`, async () => {
    expect(mockCharChanges.length).toBeGreaterThan(changeLimit);
    await renderCharInvChangesGoalList({ charChanges: mockCharChanges });
    expect(screen.queryAllByRole("listitem")).toHaveLength(changeLimit);
  });

  it("doesn't show word changes summary item when there are none", async () => {
    await renderCharInvChangesGoalList();
    expect(screen.queryAllByRole("listitem")).toHaveLength(0);
    expect(
      screen.queryByText(CharInvCompletedTextId.CharChangesNone)
    ).toBeTruthy();
  });

  it("shows word changes summary item when there are some", async () => {
    await renderCharInvChangesGoalList({ wordChanges: [mockWordChanges] });
    expect(screen.queryAllByRole("listitem")).toHaveLength(1);
    expect(
      screen.queryByText(CharInvCompletedTextId.CharChangesNone)
    ).toBeNull();
  });
});
