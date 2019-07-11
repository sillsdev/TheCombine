import axios from "axios";
import { Word, MergeWord } from "../types/word";
import { User } from "../types/user";
import { Project } from "../types/project";
import { authHeader } from "../components/Login/AuthHeaders";
import { Goal, GoalType } from "../types/goals";
import { UserEdit } from "../types/userEdit";

const backendServer = axios.create({ baseURL: "https://localhost:5001/v1" });

export function setProjectID(id: string) {
  localStorage.projectId = id;
}

export function getProjectId(): string {
  return localStorage.projectId;
}

export async function createWord(word: Word): Promise<Word> {
  let resp = await backendServer.post(`projects/${getProjectId()}/words`, word);
  return { ...word, id: resp.data };
}

export async function getWord(id: string): Promise<Word> {
  let resp = await backendServer.get(`projects/${getProjectId()}/words/${id}`);
  return resp.data;
}

export async function getAllWords(): Promise<Word[]> {
  let resp = await backendServer.get(`projects/${getProjectId()}/words`);
  return resp.data;
}

export async function mergeWords(
  parent: Word,
  children: MergeWord[]
): Promise<string> {
  parent.id = "";
  let childrenWords = children.map(child => ({
    SrcWordID: child.wordID,
    SenseStates: child.senses
  }));
  let merge = {
    Parent: parent,
    ChildrenWords: childrenWords,
    Time: Date.now().toString()
  };
  let resp = await backendServer.put(`projects/${getProjectId()}/words`, merge);
  return resp.data;
}

export async function updateWord(word: Word): Promise<Word> {
  let resp = await backendServer.put(
    `projects/${getProjectId()}/words/${word.id}`,
    word
  );
  return { ...word, id: resp.data };
}

export async function deleteWord(word: Word): Promise<Word> {
  let resp = await backendServer.delete(
    `projects/${getProjectId()}/words/${word.id}`
  );
  return { ...word, id: resp.data };
}

export async function deleteWordById(id: string): Promise<string> {
  let resp = await backendServer.delete(
    `projects/${getProjectId()}/words/${id}`
  );
  return resp.data;
}

export async function getFrontierWords(): Promise<Word[]> {
  let resp = await backendServer.get(
    `projects/${getProjectId()}/words/frontier`
  );
  return resp.data;
}

export async function addUser(user: User): Promise<User> {
  let resp = await backendServer.post(`users`, user, { headers: authHeader() });
  return { ...user, id: resp.data };
}

export async function authenticateUser(
  username: string,
  password: string
): Promise<string> {
  let resp = await backendServer.post(
    `users/authenticate`,
    { Username: username, Password: password },
    { headers: authHeader() }
  );
  return JSON.stringify(resp.data);
}

export async function getAllUsers(): Promise<User[]> {
  let resp = await backendServer.get(`users`);
  return resp.data;
}

export async function getUser(id: string): Promise<User> {
  let resp = await backendServer.get(`users/${id}`);
  return resp.data;
}

export async function updateUser(user: User): Promise<User> {
  let resp = await backendServer.put(`users/${user.id}`, user);
  return { ...user, id: resp.data };
}

export async function createProject(project: Project): Promise<Project> {
  let resp = await backendServer.post(`projects/`, project, {
    headers: authHeader()
  });
  return { ...project, id: resp.data };
}

export async function getAllProjects(): Promise<Project[]> {
  let resp = await backendServer.get(`projects`);
  return resp.data;
}

export async function getProject(id: string): Promise<Project> {
  let resp = await backendServer.get(`projects/${id}`);
  return resp.data;
}

export async function updateProject(project: Project) {
  let resp = await backendServer.put(`projects/${project.id}`, project);
  return resp.data;
}

export async function uploadLift(
  project: Project,
  lift: File
): Promise<number> {
  let data = new FormData();
  data.append("file", lift);
  let resp = await backendServer.post(
    `projects/${project.id}/words/upload`,
    data,
    {
      headers: { ...authHeader(), "Content-Type": "multipart/form-data" }
    }
  );
  return parseInt(resp.toString());
}

export async function uploadMp3(project: Project, mp3: File): Promise<string> {
  let data = new FormData();
  data.append("file", mp3);
  let resp = await backendServer.post(
    `projects/${project.id}/words/upload/audio`,
    data,
    {
      headers: { ...authHeader(), "content-type": "application/json" }
    }
  );
  return resp.data;
}

export async function addGoalToUserEdit(
  userEditId: string,
  goal: Goal
): Promise<Goal> {
  let goalType: string = goalNameToGoalTypeId(goal.name);
  let stepData: string = goal.steps.toString();
  let userEditTuple = { goalType: goalType, stepData: [stepData] };
  let resp = await backendServer.post(
    `projects/${getProjectId()}/useredits/${userEditId}`,
    userEditTuple,
    {
      headers: { ...authHeader() }
    }
  );
  return resp.data;
}

function goalNameToGoalTypeId(goalName: string): string {
  let goalType: number;
  switch (goalName) {
    case "charInventory":
      goalType = GoalType.CreateCharInv;
      break;
    case "validateChars":
      goalType = GoalType.ValidateChars;
      break;
    case "createStrWordInv":
      goalType = GoalType.CreateStrWordInv;
      break;
    case "validateStrWords":
      goalType = GoalType.ValidateStrWords;
      break;
    case "mergeDups":
      goalType = GoalType.MergeDups;
      break;
    case "spellCheckGloss":
      goalType = GoalType.SpellcheckGloss;
      break;
    case "viewFinal":
      goalType = GoalType.ViewFind;
      break;
    case "handleFlags":
      goalType = GoalType.HandleFlags;
      break;
    default:
      goalType = 8;
      break;
  }

  return goalType.toString();
}

export async function createUserEdit(): Promise<string> {
  let resp = await backendServer.post(`projects/${getProjectId()}/useredits`);
  return resp.data;
}

export async function getUserEditById(
  projId: string,
  index: string
): Promise<UserEdit> {
  let resp = await backendServer.get(`projects/${projId}/useredits/${index}`);
  return resp.data;
}

export async function getAllUserEdits(): Promise<Goal[]> {
  let resp = await backendServer.get(`projects/${getProjectId()}/useredits`);
  return resp.data;
}
