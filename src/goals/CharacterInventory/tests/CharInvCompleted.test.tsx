import { Provider } from "react-redux";
import {
  type ReactTestInstance,
  type ReactTestRenderer,
  act,
  create,
} from "react-test-renderer";
import configureMockStore from "redux-mock-store";

import WordCard from "components/WordCard";
import CharInvCompleted, {
  CharChange,
  CharInvChangesGoalList,
  CharInvCompletedId,
} from "goals/CharacterInventory/CharInvCompleted";
import {
  type CharInvChanges,
  type CharacterChange,
  CharacterStatus,
  type FindAndReplaceChange,
  defaultCharInvChanges,
} from "goals/CharacterInventory/CharacterInventoryTypes";
import { defaultState } from "goals/Redux/GoalReduxTypes";
import { type StoreState } from "types";
import { newWord as mockWord } from "types/word";

jest.mock("backend", () => ({
  areInFrontier: (ids: string[]) => Promise.resolve(ids),
  getWord: () => Promise.resolve(mockWord()),
  updateWord: () => jest.fn(),
}));

const mockCharChanges: CharacterChange[] = [
  ["a", CharacterStatus.Accepted, CharacterStatus.Rejected],
  ["b", CharacterStatus.Accepted, CharacterStatus.Undecided],
  ["c", CharacterStatus.Rejected, CharacterStatus.Accepted],
  ["d", CharacterStatus.Rejected, CharacterStatus.Undecided],
  ["e", CharacterStatus.Undecided, CharacterStatus.Accepted],
  ["f", CharacterStatus.Undecided, CharacterStatus.Rejected],
];
const mockWordKeys = ["oldA", "oldB", "oldC"];
const mockWordChanges: FindAndReplaceChange = {
  find: "Q",
  replace: "q",
  words: {
    [mockWordKeys[0]]: "newA",
    [mockWordKeys[1]]: "newB",
    [mockWordKeys[2]]: "newC",
  },
};
const mockState = (changes?: CharInvChanges): Partial<StoreState> => ({
  goalsState: {
    ...defaultState,
    currentGoal: { ...defaultState.currentGoal, changes },
  },
});

let renderer: ReactTestRenderer;
let root: ReactTestInstance;

beforeEach(() => {
  jest.resetAllMocks();
});

describe("CharInvCompleted", () => {
  const renderCharInvCompleted = async (
    changes?: CharInvChanges
  ): Promise<void> => {
    await act(async () => {
      renderer = create(
        <Provider store={configureMockStore()(mockState(changes))}>
          <CharInvCompleted />
        </Provider>
      );
    });
    root = renderer.root;
  };

  it("renders all char inv changes", async () => {
    await renderCharInvCompleted({
      ...defaultCharInvChanges,
      charChanges: mockCharChanges,
    });
    expect(root.findAllByType(CharChange)).toHaveLength(mockCharChanges.length);
    expect(root.findAllByType(WordCard)).toHaveLength(0);

    expect(() =>
      root.findByProps({ id: CharInvCompletedId.TypographyNoCharChanges })
    ).toThrow();
    root.findByProps({ id: CharInvCompletedId.TypographyNoWordChanges });
    expect(() =>
      root.findByProps({ id: CharInvCompletedId.TypographyWordChanges })
    ).toThrow();
  });

  it("renders all words changed", async () => {
    await renderCharInvCompleted({
      ...defaultCharInvChanges,
      wordChanges: [mockWordChanges],
    });
    expect(root.findAllByType(CharChange)).toHaveLength(0);
    expect(renderer.root.findAllByType(WordCard)).toHaveLength(
      mockWordKeys.length
    );

    root.findByProps({ id: CharInvCompletedId.TypographyNoCharChanges });
    expect(() =>
      root.findByProps({ id: CharInvCompletedId.TypographyNoWordChanges })
    ).toThrow();
    root.findByProps({ id: CharInvCompletedId.TypographyWordChanges });
  });
});

describe("CharInvChangesGoalList", () => {
  const renderCharInvChangesGoalList = async (
    changes?: CharInvChanges
  ): Promise<void> => {
    await act(async () => {
      renderer = create(
        CharInvChangesGoalList(changes ?? defaultCharInvChanges)
      );
    });
    root = renderer.root;
  };

  it("renders up to 3 char changes", async () => {
    const changes = (count: number): CharInvChanges => ({
      ...defaultCharInvChanges,
      charChanges: mockCharChanges.slice(0, count),
    });
    await renderCharInvChangesGoalList(changes(0));
    expect(root.findAllByType(CharChange)).toHaveLength(0);
    await renderCharInvChangesGoalList(changes(1));
    expect(root.findAllByType(CharChange)).toHaveLength(1);
    await renderCharInvChangesGoalList(changes(3));
    expect(root.findAllByType(CharChange)).toHaveLength(3);
  });

  it("doesn't render more than 3 char changes", async () => {
    expect(mockCharChanges.length).toBeGreaterThan(3);
    await renderCharInvChangesGoalList({
      ...defaultCharInvChanges,
      charChanges: mockCharChanges,
    });
    // When more than 3 changes, show 2 changes and a "+_ more" line
    expect(root.findAllByType(CharChange)).toHaveLength(2);
  });

  it("doesn't show word changes when there are none", async () => {
    await renderCharInvChangesGoalList(defaultCharInvChanges);
    expect(() =>
      root.findByProps({ id: CharInvCompletedId.TypographyNoWordChanges })
    ).toThrow();
    expect(() =>
      root.findByProps({ id: CharInvCompletedId.TypographyWordChanges })
    ).toThrow();
  });

  it("shows word changes when there are some", async () => {
    await renderCharInvChangesGoalList({
      ...defaultCharInvChanges,
      wordChanges: [mockWordChanges],
    });
    expect(() =>
      root.findByProps({ id: CharInvCompletedId.TypographyNoWordChanges })
    ).toThrow();
    root.findByProps({ id: CharInvCompletedId.TypographyWordChanges });
  });
});
