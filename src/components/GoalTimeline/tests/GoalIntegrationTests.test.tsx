import "@testing-library/jest-dom";
import { act, cleanup } from "@testing-library/react";

import "tests/reactI18nextMock.ts";
import { Permission, User, UserEdit } from "api/models";
import GoalTimeline from "components/GoalTimeline";
import { Goal } from "types/goals";
import { newUser } from "types/user";
import { renderWithProviders } from "utilities/test-utils";

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
  getCurrentPermissions: () => mockGetCurrentPermissions(),
  getUser: (id: string) => mockGetUser(id),
  getUserEditById: (id: string, index: string) =>
    mockGetUserEditById(id, index),
  updateUser: (user: User) => mockUpdateUser(user),
}));

const mockAddGoalToUserEdit = jest.fn();
const mockAddStepToGoal = jest.fn();
const mockCreateUserEdit = jest.fn();
const mockGetCurrentPermissions = jest.fn();
const mockGetUser = jest.fn();
const mockGetUserEditById = jest.fn();
const mockUpdateUser = jest.fn();
function setMockFunctions() {
  mockAddGoalToUserEdit.mockResolvedValue(0);
  mockAddStepToGoal.mockResolvedValue(0);
  mockCreateUserEdit.mockResolvedValue(mockUser);
  mockGetCurrentPermissions.mockResolvedValue([
    Permission.CharacterInventory,
    Permission.MergeAndReviewEntries,
  ]);
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

// const GoalTimelineProviders = ({
//   children,
// }: {
//   children: React.ReactNode;
// }): ReactElement => {
//   return (
//     <Provider store={testStore}>
//       <PersistGate persistor={persistor}>{children}</PersistGate>
//     </Provider>
//   );
// };

// const customRender = async (
//   ui: ReactElement,
//   options?: Omit<RenderOptions, "wrapper">
// ): Promise<void> => {
//   await act(async () => {
//     render(ui, { wrapper: GoalTimelineProviders, ...options });
//   });
// };

describe("GoalTimeline", () => {
  it("renders Goal screen", async () => {
    await act(async () => {
      renderWithProviders(<GoalTimeline />);
    });
  });
});
