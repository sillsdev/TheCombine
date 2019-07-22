import * as actions from "../GoalsActions";
import { Goal } from "../../../types/goals";
import { CreateCharInv } from "../../../goals/CreateCharInv/CreateCharInv";
import { MergeDups, MergeDupData } from "../../../goals/MergeDupGoal/MergeDups";
import configureMockStore, { MockStoreEnhanced } from "redux-mock-store";
import thunk from "redux-thunk";
import axios from "axios";
import { HandleFlags } from "../../../goals/HandleFlags/HandleFlags";
import {
  wordsArrayMock,
  goalDataMock
} from "../../../goals/MergeDupGoal/MergeDupStep/tests/MockMergeDupData";
import { ViewFinal } from "../../../goals/ViewFinal/ViewFinal";
import { User } from "../../../types/user";
import {
  MergeTreeActions,
  MergeTreeAction
} from "../../../goals/MergeDupGoal/MergeDupStep/MergeDupStepActions";
import { CreateStrWordInv } from "../../../goals/CreateStrWordInv/CreateStrWordInv";
import { SpellCheckGloss } from "../../../goals/SpellCheckGloss/SpellCheckGloss";
import { ValidateChars } from "../../../goals/ValidateChars/ValidateChars";
import { ValidateStrWords } from "../../../goals/ValidateStrWords/ValidateStrWords";
import { Word } from "../../../types/word";

const mockAxios = axios as jest.Mocked<typeof axios>;

jest.mock(
  ".././../../goals/MergeDupGoal/DuplicateFinder/DuplicateFinder",
  () => {
    const dupFinder = jest.requireActual(
      ".././../../goals/MergeDupGoal/DuplicateFinder/DuplicateFinder"
    );
    return jest.fn().mockImplementation(() => ({
      ...dupFinder,
      getNextDups: jest.fn(() => {
        return Promise.resolve(mockGoalData.plannedWords);
      })
    }));
  }
);

let mockGoalData: MergeDupData;

let oldUser: string | null;
let oldProjectId: string | null;
const mockProjectId: string = "12345";
const mockUserEditId: string = "23456";
let mockUser: User = new User("", "", "");
mockUser.workedProjects[mockProjectId] = mockUserEditId;

let goal1: Goal = new CreateCharInv();
let goal2: Goal = new CreateStrWordInv();
let goal3: Goal = new HandleFlags();
let goal4: Goal = new MergeDups();
let goal5: Goal = new SpellCheckGloss();
let goal6: Goal = new ValidateChars();
let goal7: Goal = new ValidateStrWords();
let goal8: Goal = new ViewFinal();
let allTheGoals: Goal[] = [
  goal1,
  goal2,
  goal3,
  goal4,
  goal5,
  goal6,
  goal7,
  goal8
];

let suggestionsArray: Goal[] = [...allTheGoals];

let mockHistoryGoal: Goal = new MergeDups();
mockHistoryGoal.numSteps = 1;
mockHistoryGoal.steps = [
  {
    words: [...wordsArrayMock]
  }
];

const mockStoreState = {
  goalsState: {
    historyState: {
      history: [mockHistoryGoal]
    },
    allPossibleGoals: allTheGoals,
    suggestionsState: {
      suggestions: suggestionsArray
    }
  }
};

const createMockStore = configureMockStore([thunk]);
const mockStore: MockStoreEnhanced<unknown, {}> = createMockStore(
  mockStoreState
);

beforeAll(() => {
  oldUser = localStorage.getItem("user");
  oldProjectId = localStorage.getItem("projectId");
  mockGoalData = goalDataMock;
});

beforeEach(() => {
  localStorage.removeItem("user");
  localStorage.removeItem("projectId");
});

afterEach(() => {
  if (oldUser) localStorage.setItem("user", oldUser);
  if (oldProjectId) localStorage.setItem("projectId", oldProjectId);
  mockStore.clearActions();
});

describe("Test GoalsActions", () => {
  it("should create an action to add a goal to history", () => {
    const goal: Goal = new CreateCharInv();
    const expectedAction: actions.AddGoalToHistoryAction = {
      type: actions.GoalsActions.ADD_GOAL_TO_HISTORY,
      payload: [goal]
    };
    expect(actions.addGoalToHistory(goal)).toEqual(expectedAction);
  });

  it("should create an action to load user edits", () => {
    const goalHistory: Goal[] = [new CreateCharInv(), new MergeDups()];
    const expectedAction: actions.LoadUserEditsAction = {
      type: actions.GoalsActions.LOAD_USER_EDITS,
      payload: goalHistory
    };
    expect(actions.loadUserEdits(goalHistory)).toEqual(expectedAction);
  });

  it("should create an action to update a goal", () => {
    const goal: Goal = new CreateCharInv();
    const expectedAction: actions.UpdateGoalAction = {
      type: actions.GoalsActions.UPDATE_GOAL,
      payload: [goal]
    };
    expect(actions.updateGoal(goal)).toEqual(expectedAction);
  });

  it("should create an async action to load user edits", () => {
    const mockDispatch = mockStore.dispatch<any>(
      actions.asyncLoadExistingUserEdits("1", "1")
    );

    let loadUserEdits: actions.LoadUserEditsAction = {
      type: actions.GoalsActions.LOAD_USER_EDITS,
      payload: []
    };

    mockDispatch
      .then(() => {
        expect(mockStore.getActions()).toEqual([loadUserEdits]);
      })
      .catch((err: string) => {
        fail(err);
      });
  });

  it("should dispatch an action to load a user edit", async () => {
    localStorage.setItem("user", JSON.stringify(mockUser));
    localStorage.setItem("projectId", mockProjectId);

    await mockStore
      .dispatch<any>(actions.asyncGetUserEdits())
      .then(() => {})
      .catch((err: string) => {
        fail(err);
      });

    let loadUserEditsAction: actions.LoadUserEditsAction = {
      type: actions.GoalsActions.LOAD_USER_EDITS,
      payload: []
    };

    expect(mockStore.getActions()).toEqual([loadUserEditsAction]);
  });

  it("should not dispatch any actions when creating a new user edit", async () => {
    localStorage.setItem("user", JSON.stringify(mockUser));
    localStorage.removeItem("projectId");
    await mockStore
      .dispatch<any>(actions.asyncGetUserEdits())
      .then(() => {})
      .catch((err: string) => {
        fail(err);
      });

    expect(mockStore.getActions()).toEqual([]);
  });

  it("should create an async action to add a goal to history", () => {
    const goal: Goal = new CreateCharInv();
    localStorage.setItem("projectId", mockProjectId);
    localStorage.setItem("user", JSON.stringify(mockUser));
    const mockDispatch = mockStore.dispatch<any>(
      actions.asyncAddGoalToHistory(goal)
    );

    let addGoalToHistory: actions.AddGoalToHistoryAction = {
      type: actions.GoalsActions.ADD_GOAL_TO_HISTORY,
      payload: [goal]
    };

    mockDispatch
      .then(() => {
        expect(mockStore.getActions()).toEqual([addGoalToHistory]);
      })
      .catch((err: string) => {
        fail(err);
      });
  });

  it("should return a user", () => {
    localStorage.setItem("user", JSON.stringify(mockUser));
    expect(actions.getUser()).toEqual(mockUser);
  });

  it("should return undefined when there is no user", () => {
    expect(actions.getUser()).toEqual(undefined);
  });

  // it("should dispatch UPDATE_GOAL and SET_DATA", async () => {
  //   mockAxios.get.mockImplementationOnce(() =>
  //     Promise.resolve({
  //       data: wordsArrayMock
  //     })
  //   );

  //   let theGoal: Goal = new MergeDups();
  //   theGoal.currentStep = 1;
  //   theGoal.hash = mockHistoryGoal.hash;
  //   theGoal.numSteps = mockHistoryGoal.numSteps;
  //   theGoal.data = {
  //     plannedWords: [[...wordsArrayMock]]
  //   };
  //   theGoal.steps = [
  //     {
  //       words: [...wordsArrayMock]
  //     }
  //   ];

  //   let updateGoal: actions.UpdateGoalAction = {
  //     type: actions.GoalsActions.UPDATE_GOAL,
  //     payload: [theGoal]
  //   };

  //   let setWordData: MergeTreeAction = {
  //     type: MergeTreeActions.SET_DATA,
  //     payload: [...wordsArrayMock]
  //   };

  //   await mockStore
  //     .dispatch<any>(actions.loadGoalData(mockHistoryGoal))
  //     .then(() => {})
  //     .catch((err: string) => fail(err));
  //   expect(mockStore.getActions()).toEqual([updateGoal, setWordData]);
  // });

  it("should not dispatch any actions", async () => {
    const goal: Goal = new HandleFlags();
    const expectedGoal: Goal = new HandleFlags();

    await mockStore
      .dispatch<any>(actions.loadGoalData(goal))
      .then((returnedGoal: Goal) => {
        expect(returnedGoal.data).toEqual(expectedGoal.data);
      })
      .catch((err: string) => fail(err));

    expect(mockStore.getActions()).toEqual([]);
  });

  it("should load goal data for MergeDups", async () => {
    // mockAxios.get.mockImplementationOnce(() =>
    //   Promise.resolve({
    //     data: wordsArrayMock
    //   })
    // );

    let goal: Goal = new MergeDups();
    // let theMockGoalData: MergeDupData = {
    //   plannedWords: [
    //     [
    //       wordMock,
    //       wordMock,
    //       wordMock,
    //       wordMock,
    //       wordMock,
    //       wordMock,
    //       wordMock,
    //       wordMock
    //     ],
    //     [wordMock, wordMock, wordMock, wordMock, wordMock, wordMock, wordMock],
    //     [wordMock, wordMock, wordMock, wordMock, wordMock, wordMock],
    //     [wordMock, wordMock, wordMock, wordMock, wordMock]
    //   ]
    // };

    await mockStore
      .dispatch<any>(actions.loadGoalData(goal))
      .then((returnedGoal: Goal) => {
        expect(returnedGoal.data).toEqual(mockGoalData);
      })
      .catch((err: string) => fail(err));
  });

  it("should not load any goal data", async () => {
    const goal: Goal = new HandleFlags();

    await mockStore
      .dispatch<any>(actions.loadGoalData(goal))
      .then((returnedGoal: Goal) => {
        expect(returnedGoal.data).toEqual({});
      })
      .catch((err: string) => fail(err));
  });

  it("Should update the step data of a goal", () => {
    const goal: MergeDups = new MergeDups();
    goal.data = goalDataMock;
    expect(goal.steps).toEqual([]);
    expect(goal.currentStep).toEqual(0);

    const updatedGoal: MergeDups = actions.updateStepData(goal) as MergeDups;

    expect(updatedGoal.steps[0].words).toEqual(goal.data.plannedWords[0]);
    expect(updatedGoal.currentStep).toEqual(1);
  });

  it("should return a userEditId", () => {
    localStorage.setItem("user", JSON.stringify(mockUser));
    localStorage.setItem("projectId", mockProjectId);
    expect(actions.getUserEditId(mockUser)).toEqual(mockUserEditId);
  });

  it("should return the correct goal", () => {
    const goal: Goal = new HandleFlags();
    const goal2: Goal = new CreateCharInv();
    const goal3: Goal = new MergeDups();
    const history: Goal[] = [goal, goal2, goal3];

    const currentGoal: Goal = goal2;
    let returnedIndex = actions.getIndexInHistory(history, currentGoal);

    expect(returnedIndex).toEqual(1);
  });

  it("should return -1 when a goal doesn't exist", () => {
    const goal: Goal = new HandleFlags();
    const goal2: Goal = new CreateCharInv();
    const goal3: Goal = new MergeDups();
    const history: Goal[] = [goal, goal2, goal3];

    const currentGoal: Goal = new ViewFinal();
    let returnedIndex = actions.getIndexInHistory(history, currentGoal);

    expect(returnedIndex).toEqual(-1);
  });
});
