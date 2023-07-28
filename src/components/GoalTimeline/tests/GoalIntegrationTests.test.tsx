import "@testing-library/jest-dom";
import { combineReducers, Reducer, configureStore } from "@reduxjs/toolkit";
import { act, cleanup, render, RenderOptions } from "@testing-library/react";
import { ReactElement } from "react";
import { Provider } from "react-redux";
import thunk from "redux-thunk";

import { User, UserEdit } from "api/models";
import GoalTimeline from "components/GoalTimeline";
import { goalSlice } from "components/GoalTimeline/Redux/GoalSlice";
import { Goal, GoalsState } from "types/goals";
import { newUser } from "types/user";

jest.mock("backend", () => ({
  addGoalToUserEdit: (id: string, goal: Goal) =>
    mockAddGoalToUserEdit(id, goal),
  addStepToGoal: (
    id: string,
    goalIndex: number,
    step: string,
    stepIndex?: number
  ) => mockAddStepToGoal(id, goalIndex, step, stepIndex),
  createUserEdit: () => mockCreateUserEdit(),
  getUser: (id: string) => mockGetUser(id),
  getUserEditById: (id: string, index: string) =>
    mockGetUserEditById(id, index),
  updateUser: (user: User) => mockUpdateUser(user),
}));

const mockAddGoalToUserEdit = jest.fn();
const mockAddStepToGoal = jest.fn();
const mockCreateUserEdit = jest.fn();
const mockGetUser = jest.fn();
const mockGetUserEditById = jest.fn();
const mockUpdateUser = jest.fn();
function setMockFunctions() {
  mockAddGoalToUserEdit.mockResolvedValue(0);
  mockAddStepToGoal.mockResolvedValue(0);
  mockCreateUserEdit.mockResolvedValue(mockUser);
  mockGetUser.mockResolvedValue(mockUser);
  mockGetUserEditById.mockResolvedValue(mockUserEdit);
  mockUpdateUser.mockResolvedValue(mockUser);
}

const mockProjectId = "123";
const mockUserEditId = "456";
const mockUserEdit: UserEdit = { id: mockUserEditId, edits: [], projectId: "" };
const mockUserId = "789";
const mockUser = newUser();
mockUser.id = mockUserId;
mockUser.workedProjects[mockProjectId] = mockUserEditId;

beforeEach(() => {
  jest.clearAllMocks();
  setMockFunctions();
});

afterEach(cleanup);

interface GoalsTestState {
  goalsState: GoalsState;
}

export const testReducer: Reducer<GoalsTestState> =
  combineReducers<GoalsTestState>({
    goalsState: goalSlice.reducer,
  });

const testStore = configureStore({
  reducer: testReducer,
  middleware: [thunk],
});

const GoalTimelineProviders = ({
  children,
}: {
  children: React.ReactNode;
}): ReactElement => {
  return <Provider store={testStore}>{children}</Provider>;
};

const customRender = async (
  ui: ReactElement,
  options?: Omit<RenderOptions, "wrapper">
): Promise<void> => {
  await act(async () => {
    render(ui, { wrapper: GoalTimelineProviders, ...options });
  });
};

describe("GoalTimeline", () => {
  it("renders Goal screen", async () => {
    customRender(<GoalTimeline />);
  });
});
