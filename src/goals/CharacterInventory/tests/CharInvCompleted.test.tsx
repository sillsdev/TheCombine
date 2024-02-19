import { Provider } from "react-redux";
import { type ReactTestRenderer, act, create } from "react-test-renderer";
import configureMockStore from "redux-mock-store";

import { defaultState } from "components/GoalTimeline/DefaultState";
import WordCard from "components/WordCard";
import CharInvCompleted, {
  CharChange,
  CharInvChangesGoalList,
} from "goals/CharacterInventory/CharInvCompleted";
import {
  type CharInvChanges,
  type CharacterChange,
  CharacterStatus,
  defaultCharInvChanges,
} from "goals/CharacterInventory/CharacterInventoryTypes";
import { type StoreState } from "types";
import { type Hash } from "types/hash";
import { newWord as mockWord } from "types/word";

jest.mock("backend", () => ({
  getWord: () => Promise.resolve(mockWord()),
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
const mockWordChanges: Hash<string> = {
  [mockWordKeys[0]]: "newA",
  [mockWordKeys[1]]: "newB",
  [mockWordKeys[2]]: "newC",
};
const mockState = (changes?: CharInvChanges): Partial<StoreState> => ({
  goalsState: {
    ...defaultState,
    currentGoal: { ...defaultState.currentGoal, changes },
  },
});

let renderer: ReactTestRenderer;

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
  };

  it("renders all char inv changes", async () => {
    await renderCharInvCompleted({
      charChanges: mockCharChanges,
      wordChanges: {},
    });
    expect(renderer.root.findAllByType(CharChange)).toHaveLength(
      mockCharChanges.length
    );
    expect(renderer.root.findAllByType(WordCard)).toHaveLength(0);
  });

  it("renders all words changed", async () => {
    await renderCharInvCompleted({
      charChanges: [],
      wordChanges: mockWordChanges,
    });
    expect(renderer.root.findAllByType(CharChange)).toHaveLength(0);
    expect(renderer.root.findAllByType(WordCard)).toHaveLength(
      mockWordKeys.length
    );
  });
});

describe("CharInvChangesGoalList", () => {
  const renderGoalList = async (changes?: CharInvChanges): Promise<void> => {
    await act(async () => {
      renderer = create(
        CharInvChangesGoalList(changes ?? defaultCharInvChanges)
      );
    });
  };

  it("renders up to 3 char changes", async () => {
    const changes = (count: number): CharInvChanges => ({
      charChanges: mockCharChanges.slice(0, count),
      wordChanges: mockWordChanges,
    });

    await renderGoalList(changes(0));
    expect(renderer.root.findAllByType(CharChange)).toHaveLength(0);

    await renderGoalList(changes(1));
    expect(renderer.root.findAllByType(CharChange)).toHaveLength(1);

    await renderGoalList(changes(3));
    expect(renderer.root.findAllByType(CharChange)).toHaveLength(3);
  });

  it("won't render more than 3 char changes", async () => {
    await renderGoalList({ charChanges: mockCharChanges, wordChanges: {} });
    expect(renderer.root.findAllByType(CharChange)).toHaveLength(2);
  });
});
