import { Goal } from "../../types/goals";
import { ActionWithPayload } from "../../types/mockAction";
import { Dispatch } from "redux";
import * as backend from "../../backend";
import history from "../../history";
import { User } from "../../types/user";
import { CreateCharInv } from "../../goals/CreateCharInv/CreateCharInv";
import { ValidateChars } from "../../goals/ValidateChars/ValidateChars";
import { CreateStrWordInv } from "../../goals/CreateStrWordInv/CreateStrWordInv";
import { ValidateStrWords } from "../../goals/ValidateStrWords/ValidateStrWords";
import { MergeDups, MergeDupData } from "../../goals/MergeDupGoal/MergeDups";
import { SpellCheckGloss } from "../../goals/SpellCheckGloss/SpellCheckGloss";
import { ReviewEntries } from "../../goals/ReviewEntries/ReviewEntries";
import { HandleFlags } from "../../goals/HandleFlags/HandleFlags";
import { Edit } from "../../types/userEdit";
import { GoalType } from "../../types/goals";
import DupFinder from "../../goals/MergeDupGoal/DuplicateFinder/DuplicateFinder";
import { ThunkDispatch } from "redux-thunk";
import { StoreState } from "../../types";
import { Hash } from "../../goals/MergeDupGoal/MergeDupStep/MergeDupsTree";
import {
  refreshWords,
  MergeTreeAction
} from "../../goals/MergeDupGoal/MergeDupStep/MergeDupStepActions";

export enum GoalsActions {
  LOAD_USER_EDITS = "LOAD_USER_EDITS",
  ADD_GOAL_TO_HISTORY = "ADD_GOAL_TO_HISTORY",
  UPDATE_GOAL = "UPDATE_GOAL"
}

export type GoalAction =
  | LoadUserEditsAction
  | AddGoalToHistoryAction
  | UpdateGoalAction;

export interface LoadUserEditsAction extends ActionWithPayload<Goal[]> {
  type: GoalsActions.LOAD_USER_EDITS;
  payload: Goal[];
}

export interface AddGoalToHistoryAction extends ActionWithPayload<Goal[]> {
  type: GoalsActions.ADD_GOAL_TO_HISTORY;
  payload: Goal[];
}

export interface UpdateGoalAction extends ActionWithPayload<Goal[]> {
  type: GoalsActions.UPDATE_GOAL;
  payload: Goal[];
}

export function asyncLoadExistingUserEdits(
  projectId: string,
  userEditId: string
) {
  return async (dispatch: Dispatch<GoalAction>) => {
    await backend
      .getUserEditById(projectId, userEditId)
      .then(userEdit => {
        let history: Goal[] = convertEditsToArrayOfGoals(userEdit.edits);
        dispatch(loadUserEdits(history));
      })
      .catch(err => {
        console.log(err);
      });
  };
}

function asyncCreateNewUserEditsObject(projectId: string) {
  return async () => {
    await backend
      .createUserEdit()
      .then(async (userEditId: string) => {
        let updatedUser: User = updateUserIfExists(projectId, userEditId);
        await backend.updateUser(updatedUser);
      })
      .catch(err => {
        console.log(err);
      });
  };
}

export function asyncGetUserEdits() {
  return async (dispatch: ThunkDispatch<StoreState, any, GoalAction>) => {
    let currentUserString = localStorage.getItem("user");
    if (currentUserString) {
      let currentUserObject: User = JSON.parse(currentUserString);
      let projectId: string = backend.getProjectId();
      let userEditId: string | undefined = getUserEditIdFromProjectId(
        currentUserObject.workedProjects,
        projectId
      );

      if (userEditId !== undefined) {
        dispatch(asyncLoadExistingUserEdits(projectId, userEditId));
      } else {
        dispatch(asyncCreateNewUserEditsObject(projectId));
      }
    }
  };
}

export function asyncAddGoalToHistory(goal: Goal) {
  return async (dispatch: ThunkDispatch<StoreState, any, GoalAction>) => {
    let user: User | undefined = getUser();
    if (user !== undefined) {
      let userEditId: string | undefined = getUserEditId(user);
      if (userEditId !== undefined) {
        dispatch(loadGoalData(goal)).then(
          returnedGoal => (goal = returnedGoal)
        );
        await backend
          .addGoalToUserEdit(userEditId, goal)
          .then(resp => {
            dispatch(addGoalToHistory(goal));
            history.push(`/goals/${resp}`);
          })
          .catch((err: string) => {
            console.log(err);
          });
      }
    }
  };
}

export function getUser(): User | undefined {
  let userString: string | null = localStorage.getItem("user");
  let user: User | undefined;
  if (userString) {
    user = JSON.parse(userString);
  }
  return user;
}

export function loadGoalData(goal: Goal) {
  return async (dispatch: ThunkDispatch<any, any, MergeTreeAction>) => {
    switch (goal.goalType) {
      case GoalType.MergeDups:
        let finder = new DupFinder();

        //Used for testing duplicate finder. (See docs/bitmap_testing.md)
        //let t0 = performance.now();

        let groups = await finder.getNextDups();

        //Used for testing duplicate finder. (See docs/bitmap_testing.md)
        //console.log(performance.now() - t0);

        let usedIDs: string[] = [];

        let newGroups = [];

        let blacklist: Hash<boolean> = JSON.parse(
          localStorage.getItem("mergedups_blacklist") || "{}"
        );

        for (let group of groups) {
          let newGroup = [];
          for (let word of group) {
            if (!usedIDs.includes(word.id)) {
              usedIDs.push(word.id);
              newGroup.push(word);
            }
          }
          // check blacklist
          let groupIds = newGroup.map(a => a.id).sort();
          let groupHash = groupIds.reduce((val, acc) => `${acc}:${val}`, "");
          if (!blacklist[groupHash] && newGroup.length > 1) {
            newGroups.push(newGroup);
          }
        }

        if (newGroups.length >= 8) {
          newGroups = newGroups.slice(0, 8);
        }

        goal.data = { plannedWords: newGroups };
        goal.numSteps = newGroups.length;
        goal.currentStep = 0;
        goal.steps = [];

        await dispatch(refreshWords());

        break;
      case GoalType.CreateCharInv:
        break;
      default:
        break;
    }
    return goal;
  };
}

export function updateStepData(goal: Goal): Goal {
  switch (goal.goalType) {
    case GoalType.MergeDups: {
      let currentGoalData: MergeDupData = JSON.parse(
        JSON.stringify(goal.data as MergeDupData)
      );
      goal.steps[goal.currentStep] = {
        words: currentGoalData.plannedWords[goal.currentStep]
      };
      goal.currentStep++;
      break;
    }
    default:
      break;
  }
  return goal;
}

export function getUserEditId(user: User): string | undefined {
  let projectId = backend.getProjectId();
  let userEditId: string | undefined = getUserEditIdFromProjectId(
    user.workedProjects,
    projectId
  );
  return userEditId;
}

function getUserEditIdFromProjectId(
  workedProjects: Hash<string>,
  projectId: string
): string | undefined {
  let projectIds = Object.keys(workedProjects);
  let matches: string[] = projectIds.filter(project => projectId === project);
  if (matches.length === 1) {
    return workedProjects[matches[0]];
  }
}

function updateUserIfExists(projectId: string, userEditId: string): User {
  let currentUserString = localStorage.getItem("user");
  let updatedUser: User = new User("", "", "");
  if (currentUserString) {
    let updatedUserString = updateUserWithUserEditId(
      currentUserString,
      projectId,
      userEditId
    );
    localStorage.setItem("user", updatedUserString);
    updatedUser = JSON.parse(updatedUserString);
  }
  return updatedUser;
}

function updateUserWithUserEditId(
  userObjectString: string,
  projectId: string,
  userEditId: string
): string {
  let currentUserObject: User = JSON.parse(userObjectString);
  currentUserObject = addProjectToWorkedProjects(
    currentUserObject,
    projectId,
    userEditId
  );
  let updatedUserString = JSON.stringify(currentUserObject);
  return updatedUserString;
}

function addProjectToWorkedProjects(
  user: User,
  projectId: string,
  userEditId: string
): User {
  user.workedProjects[projectId] = userEditId;
  return user;
}

export function getIndexInHistory(history: Goal[], currentGoal: Goal): number {
  for (let i = 0; i < history.length; i++) {
    if (history[i].hash === currentGoal.hash) {
      return i;
    }
  }
  return -1;
}

function convertEditsToArrayOfGoals(edits: Edit[]): Goal[] {
  let history: Goal[] = [];
  for (var edit of edits) {
    let nextGoal: Goal | undefined = goalTypeToGoal(edit.goalType);
    if (nextGoal) {
      history.push(nextGoal);
    }
  }
  return history;
}

function goalTypeToGoal(type: number): Goal | undefined {
  switch (type) {
    case GoalType.CreateCharInv:
      return new CreateCharInv();
    case GoalType.ValidateChars:
      return new ValidateChars();
    case GoalType.CreateStrWordInv:
      return new CreateStrWordInv();
    case GoalType.ValidateStrWords:
      return new ValidateStrWords();
    case GoalType.MergeDups:
      return new MergeDups();
    case GoalType.SpellcheckGloss:
      return new SpellCheckGloss();
    case GoalType.ReviewEntries:
      return new ReviewEntries();
    case GoalType.HandleFlags:
      return new HandleFlags();
    default:
      return undefined;
  }
}

export function addGoalToHistory(goal: Goal): AddGoalToHistoryAction {
  return { type: GoalsActions.ADD_GOAL_TO_HISTORY, payload: [goal] };
}

export function loadUserEdits(history: Goal[]): LoadUserEditsAction {
  return { type: GoalsActions.LOAD_USER_EDITS, payload: history };
}

export function updateGoal(goal: Goal): UpdateGoalAction {
  return { type: GoalsActions.UPDATE_GOAL, payload: [goal] };
}
